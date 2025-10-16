import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "./admin-flights.css";

/* ------------ Helpers ------------ */
function toISODate(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function toLocalDTInput(ts) {
  // -> "YYYY-MM-DDTHH:MM" za <input type="datetime-local">
  const d = ts ? new Date(ts) : new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fmtDateTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit"
  });
}

/* ------------ Airport async select (autocomplete) ------------ */
function AirportSelect({ label = "Aerodrom", valueId, onChange }) {
  const [q, setQ] = useState("");
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sel, setSel] = useState(null); // {id, code, name, city, country}

  useEffect(() => {
    // ako već imamo selected id, ne učitavamo podatke automatski
  }, [valueId]);

  async function searchAirports(v) {
    setLoading(true);
    try {
      const res = await api.get(`/api/airports?q=${encodeURIComponent(v || "")}`);
      setList(res.data || []);
      setOpen(true);
    } catch (e) {
      setList([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  function choose(a) {
    setSel(a);
    setQ(`${a.code} — ${a.city || a.name || ""}`.trim());
    setOpen(false);
    onChange?.(a.id, a); // vrati id i ceo objekat (korisno za prikaz)
  }

  // kada imamo valueId ali nema sel (npr. na edit), prikaži samo ID u placeholderu
  const displayValue = sel ? `${sel.code} — ${sel.city || sel.name || ""}` : q;

  return (
    <div className="field">
      <span>{label}</span>
      <div className="airport-select">
        <input
          value={displayValue}
          onChange={(e) => {
            setSel(null);
            setQ(e.target.value);
            if (e.target.value.length >= 2) searchAirports(e.target.value);
            else {
              setList([]);
              setOpen(false);
            }
          }}
          onFocus={() => { if (q.length >= 2 && list.length > 0) setOpen(true); }}
          placeholder="npr. BEG ili Paris"
        />
        {loading && <div className="as-loading">Tražim…</div>}
        {open && list.length > 0 && (
          <div className="as-list">
            {list.map((a) => (
              <button key={a.id} type="button" className="as-item" onClick={() => choose(a)}>
                <div className="as-line">
                  <b className="code">{a.code}</b>
                  <span className="name">{a.name}</span>
                </div>
                <div className="as-sub">
                  {a.city}{a.city && a.country ? ", " : ""}{a.country}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------ Modal (reusable) ------------ */
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="ghost close" onClick={onClose} aria-label="Zatvori">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ------------ Glavna admin stranica ------------ */
export default function AdminFlightsPage() {
  // filteri
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  // lista/paginacija
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null); // paginator payload
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // create/edit modal state
  const blankForm = {
    code: "",
    origin_airport_id: "",
    destination_airport_id: "",
    departure_at: toLocalDTInput(new Date(Date.now() + 3600 * 1000)), // +1h
    arrival_at:   toLocalDTInput(new Date(Date.now() + 3 * 3600 * 1000)), // +3h
    seats_total:  180,
    seats_available: 180,
    base_price:  99.00,
  };
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [formErr, setFormErr] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // delete confirm
  const [delId, setDelId] = useState(null);
  const [delLoading, setDelLoading] = useState(false);
  const [delErr, setDelErr] = useState("");

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (origin) p.set("origin", origin.trim().toUpperCase());
    if (destination) p.set("destination", destination.trim().toUpperCase());
    if (date) p.set("date", date);
    p.set("page", page);
    return p.toString();
  }, [origin, destination, date, page]);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get(`/api/flights/search?${params}`);
      setData(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Greška pri učitavanju letova.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  function resetFilters(e) {
    e?.preventDefault?.();
    setOrigin("");
    setDestination("");
    setDate("");
    setPage(1);
  }

  function openCreate() {
    setEditId(null);
    setForm({ ...blankForm });
    setFormErr("");
    setShowForm(true);
  }

  function openEdit(f) {
    setEditId(f.id);
    setForm({
      code: f.code || "",
      origin_airport_id: f.origin_airport_id || f.origin?.id || "",
      destination_airport_id: f.destination_airport_id || f.destination?.id || "",
      departure_at: toLocalDTInput(f.departure_at),
      arrival_at:   toLocalDTInput(f.arrival_at),
      seats_total:  f.seats_total ?? 0,
      seats_available: f.seats_available ?? 0,
      base_price:   Number(f.base_price) ?? 0,
    });
    setFormErr("");
    setShowForm(true);
  }

  async function submitForm(e) {
    e?.preventDefault?.();
    setFormErr("");
    // jednostavne validacije
    if (!form.code.trim()) return setFormErr("Unesi šifru leta (code).");
    if (!form.origin_airport_id || !form.destination_airport_id) return setFormErr("Izaberi polazni i dolazni aerodrom.");
    if (form.origin_airport_id === form.destination_airport_id) return setFormErr("Origin i destination moraju biti različiti.");
    if (!form.departure_at || !form.arrival_at) return setFormErr("Unesi datum/vreme polaska i dolaska.");

    const payload = {
      code: form.code.trim(),
      origin_airport_id: Number(form.origin_airport_id),
      destination_airport_id: Number(form.destination_airport_id),
      departure_at: new Date(form.departure_at).toISOString(),
      arrival_at:   new Date(form.arrival_at).toISOString(),
      seats_total: Number(form.seats_total) || 0,
      seats_available: Number(form.seats_available) || 0,
      base_price: Number(form.base_price) || 0,
    };

    setFormLoading(true);
    try {
      if (editId) {
        await api.put(`/api/admin/flights/${editId}`, payload);
      } else {
        await api.post(`/api/admin/flights`, payload);
      }
      setShowForm(false);
      await load();
    } catch (e2) {
      setFormErr(
        e2?.response?.data?.message ||
        e2?.response?.data?.errors?.code?.[0] ||
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
      await api.delete(`/api/admin/flights/${delId}`);
      setDelId(null);
      await load();
    } catch (e) {
      setDelErr(e?.response?.data?.message || "Brisanje nije uspelo.");
    } finally {
      setDelLoading(false);
    }
  }

  const items = data?.data || [];

  return (
    <div className="admin-flights-page">
      <div className="av-bg-lite" aria-hidden="true" />

      <div className="af-container">
        <div className="af-header">
          <div>
            <h1 className="af-title">Admin · Letovi</h1>
            <p className="af-sub">Upravljanje letovima, pretraga i paginacija.</p>
          </div>
          <div className="af-actions">
            <button className="av-btn" onClick={openCreate}>+ Novi let</button>
          </div>
        </div>

        {/* Filter forma */}
        <form className="af-filters" onSubmit={(e)=>{e.preventDefault(); setPage(1); load();}}>
          <label className="field">
            <span>Origin</span>
            <input value={origin} onChange={(e)=>setOrigin(e.target.value)} placeholder="BEG" maxLength={8}/>
          </label>
          <label className="field">
            <span>Destination</span>
            <input value={destination} onChange={(e)=>setDestination(e.target.value)} placeholder="CDG" maxLength={8}/>
          </label>
          <label className="field">
            <span>Datum</span>
            <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
          </label>

          <div className="filter-actions">
            <button className="av-btn" type="submit">Pretraži</button>
            <button className="av-btn ghost" type="button" onClick={resetFilters}>Reset</button>
          </div>
        </form>

        {/* Error / Loading */}
        {err && <div className="error" role="alert">{err}</div>}
        {loading && !data && <div className="loading">Učitavam…</div>}

        {/* Tabela */}
        <div className="table-wrap">
          <table className="af-table">
            <thead>
              <tr>
                <th>Šifra</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Polazak</th>
                <th>Dolazak</th>
                <th>Sedišta</th>
                <th>Cena</th>
                <th style={{width:120}}>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="empty">Nema letova za dato filtriranje.</td>
                </tr>
              )}
              {items.map((f) => (
                <tr key={f.id}>
                  <td className="mono">{f.code}</td>
                  <td>
                    <div className="cell-apt">
                      <b>{f.origin?.code}</b>
                      <span className="muted">{f.origin?.city}</span>
                    </div>
                  </td>
                  <td>
                    <div className="cell-apt">
                      <b>{f.destination?.code}</b>
                      <span className="muted">{f.destination?.city}</span>
                    </div>
                  </td>
                  <td className="mono">{fmtDateTime(f.departure_at)}</td>
                  <td className="mono">{fmtDateTime(f.arrival_at)}</td>
                  <td className="mono">{f.seats_available}/{f.seats_total}</td>
                  <td className="mono">{Number(f.base_price).toFixed(2)} €</td>
                  <td className="actions">
                    <button className="pill" onClick={()=>openEdit(f)}>Izmeni</button>
                    <button className="pill danger" onClick={()=>setDelId(f.id)}>Obriši</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginacija */}
        {data?.last_page > 1 && (
          <div className="pager">
            <button
              className="pill"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Prethodna
            </button>
            <span className="page-info">Strana {data.current_page} / {data.last_page}</span>
            <button
              className="pill"
              disabled={page >= data.last_page}
              onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
            >
              Sledeća →
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      {showForm && (
        <Modal title={editId ? "Izmeni let" : "Novi let"} onClose={()=>setShowForm(false)}>
          <form className="af-form" onSubmit={submitForm}>
            <label className="field">
              <span>Šifra leta</span>
              <input
                value={form.code}
                onChange={(e)=>setForm((s)=>({...s, code: e.target.value}))}
                placeholder="npr. JU180"
                required
              />
            </label>

            <AirportSelect
              label="Origin aerodrom"
              valueId={form.origin_airport_id}
              onChange={(id)=>setForm((s)=>({...s, origin_airport_id: id}))}
            />
            <AirportSelect
              label="Destination aerodrom"
              valueId={form.destination_airport_id}
              onChange={(id)=>setForm((s)=>({...s, destination_airport_id: id}))}
            />

            <div className="grid2">
              <label className="field">
                <span>Polazak</span>
                <input
                  type="datetime-local"
                  value={form.departure_at}
                  onChange={(e)=>setForm((s)=>({...s, departure_at: e.target.value}))}
                  required
                />
              </label>
              <label className="field">
                <span>Dolazak</span>
                <input
                  type="datetime-local"
                  value={form.arrival_at}
                  onChange={(e)=>setForm((s)=>({...s, arrival_at: e.target.value}))}
                  required
                />
              </label>
            </div>

            <div className="grid3">
              <label className="field">
                <span>Ukupno sedišta</span>
                <input
                  type="number"
                  min="1"
                  value={form.seats_total}
                  onChange={(e)=>setForm((s)=>({...s, seats_total: e.target.value}))}
                  required
                />
              </label>
              <label className="field">
                <span>Dostupno</span>
                <input
                  type="number"
                  min="0"
                  value={form.seats_available}
                  onChange={(e)=>setForm((s)=>({...s, seats_available: e.target.value}))}
                  required
                />
              </label>
              <label className="field">
                <span>Osnovna cena (€)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.base_price}
                  onChange={(e)=>setForm((s)=>({...s, base_price: e.target.value}))}
                  required
                />
              </label>
            </div>

            {formErr && <div className="error" role="alert">{formErr}</div>}

            <div className="modal-actions">
              <button type="button" className="av-btn ghost" onClick={()=>setShowForm(false)}>Otkaži</button>
              <button type="submit" className="av-btn" disabled={formLoading}>
                {formLoading ? "Čuvam…" : (editId ? "Sačuvaj izmene" : "Kreiraj")}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirm modal */}
      {delId && (
        <Modal title="Obriši let" onClose={()=>setDelId(null)}>
          <div className="confirm-box">
            <p>Da li sigurno želiš da obrišeš ovaj let?</p>
            {delErr && <div className="error" role="alert">{delErr}</div>}
            <div className="modal-actions">
              <button className="av-btn ghost" onClick={()=>setDelId(null)}>Ne</button>
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
