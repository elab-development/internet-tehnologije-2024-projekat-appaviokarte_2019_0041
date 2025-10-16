import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "./flights.css";

function toISODate(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function fmtTime(ts) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
function fmtDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}
function diffMinutes(a, b) {
  const ms = new Date(b) - new Date(a);
  return Math.max(0, Math.round(ms / 60000));
}
function fmtDuration(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

export default function FlightsPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState(toISODate());
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null); // Laravel paginator payload
  const [page, setPage] = useState(1);

  // rezervacija modal
  const [open, setOpen] = useState(false);
  const [flightSel, setFlightSel] = useState(null);
  const [pax, setPax] = useState([]);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookErr, setBookErr] = useState("");
  const [bookOk, setBookOk] = useState(null); // payload sa bookingom

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (origin) p.set("origin", origin.trim().toUpperCase());
    if (destination) p.set("destination", destination.trim().toUpperCase());
    if (date) p.set("date", date);
    p.set("page", page);
    return p.toString();
  }, [origin, destination, date, page]);

  async function fetchFlights() {
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
    fetchFlights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  function onSubmit(e) {
    e.preventDefault();
    setPage(1);
    fetchFlights();
  }

  function openBookingModal(flight) {
    setFlightSel(flight);
    // default jedan putnik sa osnovnom cenom
    const base = Number(flight.base_price) || 0;
    setPax([{ first_name: "", last_name: "", date_of_birth: "", passport_number: "", seat: "", price: base }]);
    setBookErr("");
    setBookOk(null);
    setOpen(true);
  }
  function closeBookingModal() {
    setOpen(false);
    setFlightSel(null);
    setPax([]);
    setBookErr("");
    setBookOk(null);
  }

  function setPaxField(idx, field, value) {
    setPax((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  }
  function addPassenger() {
    const base = Number(flightSel?.base_price) || 0;
    setPax((prev) => [...prev, { first_name: "", last_name: "", date_of_birth: "", passport_number: "", seat: "", price: base }]);
  }
  function removePassenger(idx) {
    setPax((prev) => prev.filter((_, i) => i !== idx));
  }

  async function submitBooking(e) {
    e?.preventDefault?.();
    if (!flightSel) return;

    // jednostavna provera
    for (const p of pax) {
      if (!p.first_name?.trim() || !p.last_name?.trim()) {
        setBookErr("Unesite ime i prezime za sve putnike.");
        return;
      }
      if (Number(p.price) < 0) {
        setBookErr("Cena ne može biti negativna.");
        return;
      }
    }

    setBookLoading(true);
    setBookErr("");
    try {
      const payload = {
        flight_id: flightSel.id,
        passengers: pax.map((p) => ({
          first_name: p.first_name.trim(),
          last_name: p.last_name.trim(),
          date_of_birth: p.date_of_birth || null,
          passport_number: p.passport_number || null,
          seat: p.seat || null,
          price: Number(p.price) || 0,
        })),
      };
      const res = await api.post("/api/bookings", payload);
      setBookOk(res.data);
      // osveži listu (smanji seats_available)
      fetchFlights();
    } catch (e) {
      setBookErr(e?.response?.data?.message || "Rezervacija nije uspela.");
    } finally {
      setBookLoading(false);
    }
  }

  return (
    <div className="flights-page">
      <div className="av-bg-lite" aria-hidden="true" />

      <div className="flights-container">
        <h1 className="flights-title">Pretraga letova</h1>
        <p className="flights-sub">Pronađi najbolje opcije za svoj sledeći let.</p>

        <form className="flights-form" onSubmit={onSubmit}>
          <label>
            <span>Origin</span>
            <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="BEG" maxLength={8} />
          </label>
          <label>
            <span>Destination</span>
            <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="CDG" maxLength={8} />
          </label>
          <label>
            <span>Datum</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>

          <button className="av-btn" type="submit" disabled={loading}>
            {loading ? "Tražim…" : "Pretraži"}
          </button>
        </form>

        {err && <div className="error" role="alert">{err}</div>}

        <div className="flights-grid">
          {loading && !data && <div className="loading">Učitavam letove…</div>}

          {data?.data?.length === 0 && !loading && <div className="empty">Nema rezultata za zadate filtere.</div>}

          {data?.data?.map((f) => {
            const minutes = diffMinutes(f.departure_at, f.arrival_at);
            const price = (Number(f.base_price) ?? 0).toFixed(2);
            return (
              <article className="flight-card" key={f.id} tabIndex={0}>
                <div className="flight-head">
                  <div className="flight-code">{f.code}</div>
                  <div className="flight-date">{fmtDate(f.departure_at)}</div>
                </div>

                <div className="flight-route">
                  <div className="leg">
                    <div className="time">{fmtTime(f.departure_at)}</div>
                    <div className="apt">
                      <span className="apt-code">{f.origin?.code}</span>
                      <span className="apt-name">{f.origin?.city}</span>
                    </div>
                  </div>

                  <div className="line">
                    <span className="dot" />
                    <span className="bar" />
                    <span className="plane-icon">✈</span>
                    <span className="bar" />
                    <span className="dot" />
                  </div>

                  <div className="leg end">
                    <div className="time">{fmtTime(f.arrival_at)}</div>
                    <div className="apt">
                      <span className="apt-code">{f.destination?.code}</span>
                      <span className="apt-name">{f.destination?.city}</span>
                    </div>
                  </div>
                </div>

                <div className="flight-meta">
                  <span className="badge">{fmtDuration(minutes)}</span>
                  <span className="badge seats">Slobodna mesta: {f.seats_available}</span>
                  <span className="price">od {price} €</span>
                </div>

                <div className="flight-actions">
                  {/* Detalji uklonjen */}
                  <button className="av-btn" onClick={() => openBookingModal(f)}>
                    Rezerviši
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {data?.last_page > 1 && (
          <div className="pager">
            <button className="pill" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              ← Prethodna
            </button>
            <span className="page-info">Strana {data.current_page} / {data.last_page}</span>
            <button className="pill" disabled={page >= data.last_page} onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}>
              Sledeća →
            </button>
          </div>
        )}
      </div>

      {/* MODAL */}
      {open && flightSel && (
        <div className="modal-backdrop" onClick={closeBookingModal}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rezervacija</h3>
              <button className="ghost close" onClick={closeBookingModal} aria-label="Zatvori">✕</button>
            </div>

            <div className="modal-flight">
              <div className="code">{flightSel.code}</div>
              <div className="route">
                {flightSel.origin?.code} {fmtTime(flightSel.departure_at)} → {flightSel.destination?.code} {fmtTime(flightSel.arrival_at)}
              </div>
              <div className="sub">{fmtDate(flightSel.departure_at)} · {fmtDuration(diffMinutes(flightSel.departure_at, flightSel.arrival_at))}</div>
            </div>

            {bookOk ? (
              <div className="booking-success">
                <h4>Uspešno rezervisano 🎉</h4>
                <p>Šifra rezervacije: <b>{bookOk.booking_code || bookOk.id}</b></p>
                <p>Ukupno: <b>{(Number(bookOk.total_price) || 0).toFixed(2)} €</b></p>
                <div className="flight-actions">
                  <button className="av-btn" onClick={closeBookingModal}>Zatvori</button>
                </div>
              </div>
            ) : (
              <form className="pax-form" onSubmit={submitBooking}>
                {pax.map((p, i) => (
                  <div className="pax-card" key={i}>
                    <div className="pax-row">
                      <label>
                        <span>Ime</span>
                        <input value={p.first_name} onChange={(e)=>setPaxField(i,"first_name",e.target.value)} required />
                      </label>
                      <label>
                        <span>Prezime</span>
                        <input value={p.last_name} onChange={(e)=>setPaxField(i,"last_name",e.target.value)} required />
                      </label>
                    </div>

                    <div className="pax-row">
                      <label>
                        <span>Datum rođenja</span>
                        <input type="date" value={p.date_of_birth} onChange={(e)=>setPaxField(i,"date_of_birth",e.target.value)} />
                      </label>
                      <label>
                        <span>Broj pasoša</span>
                        <input value={p.passport_number} onChange={(e)=>setPaxField(i,"passport_number",e.target.value)} />
                      </label>
                    </div>

                    <div className="pax-row">
                      <label>
                        <span>Sedište</span>
                        <input value={p.seat} onChange={(e)=>setPaxField(i,"seat",e.target.value)} placeholder="npr. 12A" />
                      </label>
                      <label>
                        <span>Cena</span>
                        <input type="number" min="0" step="0.01" value={p.price} onChange={(e)=>setPaxField(i,"price",e.target.value)} />
                      </label>
                    </div>

                    {pax.length > 1 && (
                      <div className="pax-actions">
                        <button type="button" className="pill danger" onClick={()=>removePassenger(i)}>Ukloni putnika</button>
                      </div>
                    )}
                  </div>
                ))}

                <div className="pax-toolbar">
                  <button type="button" className="pill" onClick={addPassenger}>+ Dodaj putnika</button>
                  <div className="total">
                    Ukupno:{" "}
                    <b>
                      {pax.reduce((sum, p) => sum + (Number(p.price) || 0), 0).toFixed(2)} €
                    </b>
                  </div>
                </div>

                {bookErr && <div className="error" role="alert">{bookErr}</div>}

                <div className="flight-actions">
                  <button type="button" className="av-btn ghost" onClick={closeBookingModal}>Otkaži</button>
                  <button type="submit" className="av-btn" disabled={bookLoading}>
                    {bookLoading ? "Rezervišem…" : "Potvrdi rezervaciju"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
