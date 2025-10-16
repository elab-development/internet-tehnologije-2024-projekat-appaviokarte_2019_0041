import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "./admin-passengers.css";

/* ------------------------ Helpers ------------------------ */
function fmtDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toISOString().slice(0, 10); // yyyy-mm-dd
}
function fmtMoney(n) {
  const v = Number(n) || 0;
  return v.toFixed(2) + " €";
}

/* ------------------------ Modal -------------------------- */
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="ghost close" onClick={onClose} aria-label="Zatvori">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ----------------------- Stranica ------------------------ */
export default function AdminPassengersPage() {
  // Način učitavanja: preko booking_id ili booking_code
  const [bookingId, setBookingId] = useState("");
  const [bookingCode, setBookingCode] = useState("");

  // Booking meta (za info bar)
  const [booking, setBooking] = useState(null);

  // Lista putnika (paginator payload)
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);

  // UI state
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Create/Edit modal
  const blankForm = {
    first_name: "",
    last_name: "",
    date_of_birth: "",
    passport_number: "",
    seat_number: "",      
    price: 0,
  };
  const [showForm, setShowForm] = useState(false);
  const [editPassenger, setEditPassenger] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [formErr, setFormErr] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Delete
  const [delId, setDelId] = useState(null);
  const [delLoading, setDelLoading] = useState(false);
  const [delErr, setDelErr] = useState("");

  const query = useMemo(() => `?page=${page}`, [page]);

  async function resolveBookingId() {
    // Ako je unet booking_code, prvo ga razrešimo u booking id
    if (bookingCode.trim()) {
      const code = bookingCode.trim().toUpperCase();
      // Pošto ne postoji /api/bookings/search endpoint, najsigurnije je mali helper:
      // ako ga nemaš na backendu, možeš privremeno uneti ID ručno ili dodati rutu.
      // Ovde ću koristiti fallback: pokušaj GET /api/bookings/{code} (ako si dopustila route model binding po code),
      // u suprotnom izbaci info da se unosi ID.
      try {
        // POKUŠAJ: ako backend nema ovu putanju, preskoči.
        const res = await api.get(`/api/bookings/${code}`);
        return res.data?.id || "";
      } catch {
        // Nema rute po code — u tom slučaju koristimo bookingId input
        return bookingId.trim();
      }
    }
    return bookingId.trim();
  }

  async function loadPassengers(forcedPage = null) {
    setLoading(true);
    setErr("");
    try {
      const id = await resolveBookingId();
      if (!id) {
        setData(null);
        setBooking(null);
        throw new Error("Unesi Booking ID ili validan kod rezervacije (PNR).");
      }

      // Učitaj meta o rezervaciji (radi prikaza rute/statusa)
      try {
        const meta = await api.get(`/api/bookings/${id}`);
        setBooking(meta.data);
      } catch {
        setBooking(null);
      }

      const p = forcedPage ?? page;
      const res = await api.get(`/api/bookings/${id}/passengers?page=${p}`);
      setData(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Greška pri učitavanju putnika.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  function startCreate() {
    setEditPassenger(null);
    setForm({ ...blankForm });
    setFormErr("");
    setShowForm(true);
  }

  function startEdit(p) {
    setEditPassenger(p);
    setForm({
      first_name: p.first_name || "",
      last_name: p.last_name || "",
      date_of_birth: p.date_of_birth || "",
      passport_number: p.passport_number || "",
      seat_number:  p.seat_number ?? "", 
      price: p.price ?? 0,
    });
    setFormErr("");
    setShowForm(true);
  }

  async function submitForm(e) {
    e?.preventDefault?.();
    setFormErr("");
    const id = await resolveBookingId();
    if (!id) return setFormErr("Nedostaje Booking ID.");

    // jednostavna validacija
    if (!form.first_name.trim()) return setFormErr("Unesi ime.");
    if (!form.last_name.trim()) return setFormErr("Unesi prezime.");
    if (form.price === "" || Number.isNaN(Number(form.price))) return setFormErr("Cena mora biti broj.");

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      date_of_birth: form.date_of_birth || null,
      passport_number: form.passport_number || null,
      seat_number: form.seat_number || null,  
      price: Number(form.price) || 0,
    };

    setFormLoading(true);
    try {
      if (editPassenger) {
        await api.put(`/api/passengers/${editPassenger.id}`, payload);
      } else {
        await api.post(`/api/bookings/${id}/passengers`, payload);
      }
      setShowForm(false);
      // Ako je kreiran novi putnik na poslednjoj strani, Laravel može promeniti paginaciju.
      // Najjednostavnije: vrati se na prvu stranu radi konzistentnosti:
      setPage(1);
      await loadPassengers(1);
    } catch (e2) {
      setFormErr(
        e2?.response?.data?.message ||
          e2?.response?.data?.errors?.first_name?.[0] ||
          "Čuvanje nije uspelo."
      );
    } finally {
      setFormLoading(false);
    }
  }

  async function confirmDelete() {
    if (!delId) return;
    setDelLoading(true);
    setDelErr("");
    try {
      await api.delete(`/api/passengers/${delId}`);
      setDelId(null);
      // Ako obrišemo poslednjeg na strani, može da se promeni paginacija — osveži trenutnu
      await loadPassengers();
    } catch (e) {
      setDelErr(e?.response?.data?.message || "Brisanje nije uspelo.");
    } finally {
      setDelLoading(false);
    }
  }

  const items = data?.data || [];

  return (
    <div className="admin-passengers-page">
      <div className="av-bg-lite" aria-hidden="true" />

      <div className="ap-container">
        <div className="ap-header">
          <div>
            <h1 className="ap-title">Admin · Putnici</h1>
            <p className="ap-sub">Upravljanje putnicima po rezervaciji (CRUD + paginacija).</p>
          </div>
          <div className="ap-actions">
            <button className="av-btn" onClick={startCreate} disabled={!booking && !bookingId && !bookingCode}>
              + Novi putnik
            </button>
          </div>
        </div>

        {/* Pretraga rezervacije */}
        <form
          className="ap-search"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            loadPassengers(1);
          }}
        >
          <label className="field">
            <span>Booking ID</span>
            <input
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="npr. 42"
              inputMode="numeric"
            />
          </label>
          <div className="or">ili</div>
          <label className="field">
            <span>Booking kod (PNR)</span>
            <input
              value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
              placeholder="npr. PNRABC123"
            />
          </label>

          <div className="search-actions">
            <button className="av-btn" type="submit">Učitaj putnike</button>
            <button
              className="av-btn ghost"
              type="button"
              onClick={() => {
                setBookingId("");
                setBookingCode("");
                setData(null);
                setBooking(null);
                setErr("");
                setPage(1);
              }}
            >
              Reset
            </button>
          </div>
        </form>

        {/* Booking meta info */}
        {booking && (
          <div className="ap-booking-box">
            <div className="line1">
              <span className="pnr">PNR: <b>{booking.booking_code}</b></span>
              <span className={`status ${booking.status === "canceled" ? "warn" : "ok"}`}>
                {booking.status}
              </span>
            </div>
            <div className="line2">
              <span>{booking.flight?.code}</span>
              <span> · {booking.flight?.origin?.code} → {booking.flight?.destination?.code}</span>
              <span> · ukupno: {fmtMoney(booking.total_price)}</span>
            </div>
          </div>
        )}

        {/* Error / Loading */}
        {err && <div className="error" role="alert">{err}</div>}
        {loading && !data && <div className="loading">Učitavam…</div>}

        {/* Tabela putnika */}
        {!!data && (
          <div className="table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Ime</th>
                  <th>Prezime</th>
                  <th>Datum rođenja</th>
                  <th>Pasoš</th>
                  <th>Sedište</th>
                  <th>Cena</th>
                  <th style={{ width: 150 }}>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="empty">Nema putnika.</td>
                  </tr>
                )}
                {items.map((p) => (
                  <tr key={p.id}>
                    <td>{p.first_name}</td>
                    <td>{p.last_name}</td>
                    <td className="mono">{fmtDate(p.date_of_birth)}</td>
                    <td className="mono">{p.passport_number}</td>
                    <td className="mono">{p.seat_number ??  ""}</td>
                    <td className="mono">{fmtMoney(p.price)}</td>
                    <td className="actions">
                      <button className="pill" onClick={() => startEdit(p)}>Izmeni</button>
                      <button className="pill danger" onClick={() => setDelId(p.id)}>Obriši</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginacija */}
        {!!data && data.last_page > 1 && (
          <div className="pager">
            <button
              className="pill"
              disabled={page <= 1}
              onClick={() => {
                const np = Math.max(1, page - 1);
                setPage(np);
                loadPassengers(np);
              }}
            >
              ← Prethodna
            </button>
            <span className="page-info">
              Strana {data.current_page} / {data.last_page}
            </span>
            <button
              className="pill"
              disabled={page >= data.last_page}
              onClick={() => {
                const np = Math.min(data.last_page, page + 1);
                setPage(np);
                loadPassengers(np);
              }}
            >
              Sledeća →
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      {showForm && (
        <Modal title={editPassenger ? "Izmeni putnika" : "Novi putnik"} onClose={() => setShowForm(false)}>
          <form className="ap-form" onSubmit={submitForm}>
            <div className="grid2">
              <label className="field">
                <span>Ime</span>
                <input
                  value={form.first_name}
                  onChange={(e) => setForm((s) => ({ ...s, first_name: e.target.value }))}
                  required
                />
              </label>
              <label className="field">
                <span>Prezime</span>
                <input
                  value={form.last_name}
                  onChange={(e) => setForm((s) => ({ ...s, last_name: e.target.value }))}
                  required
                />
              </label>
            </div>

            <div className="grid3">
              <label className="field">
                <span>Datum rođenja</span>
                <input
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => setForm((s) => ({ ...s, date_of_birth: e.target.value }))}
                />
              </label>
              <label className="field">
                <span>Broj pasoša</span>
                <input
                  value={form.passport_number}
                  onChange={(e) => setForm((s) => ({ ...s, passport_number: e.target.value }))}
                  maxLength={32}
                />
              </label>
              <label className="field">
                <span>Sedište</span>
                <input
                  value={form.seat_number}
                  onChange={(e) => setForm((s) => ({ ...s, seat_number: e.target.value }))}
                  maxLength={10}
                  placeholder="npr. 12A"
                />
              </label>
            </div>

            <label className="field">
              <span>Cena (€)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
                required
              />
            </label>

            {formErr && <div className="error" role="alert">{formErr}</div>}

            <div className="modal-actions">
              <button type="button" className="av-btn ghost" onClick={() => setShowForm(false)}>
                Otkaži
              </button>
              <button type="submit" className="av-btn" disabled={formLoading}>
                {formLoading ? "Čuvam…" : editPassenger ? "Sačuvaj izmene" : "Dodaj putnika"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirm */}
      {delId && (
        <Modal title="Obriši putnika" onClose={() => setDelId(null)}>
          <div className="confirm-box">
            <p>Da li sigurno želiš da obrišeš ovog putnika?</p>
            {delErr && <div className="error" role="alert">{delErr}</div>}
            <div className="modal-actions">
              <button className="av-btn ghost" onClick={() => setDelId(null)}>Ne</button>
              <button className="av-btn danger" onClick={confirmDelete} disabled={delLoading}>
                {delLoading ? "Brišem…" : "Da, obriši"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
