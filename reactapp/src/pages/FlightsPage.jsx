import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "./flights.css";

function toISODate(d = new Date()) {
  // yyyy-mm-dd
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
  }, [params]); // refetch kad se promene filteri ili strana

  function onSubmit(e) {
    e.preventDefault();
    setPage(1); // resetuj paginaciju kad se pretraži ručno
    fetchFlights();
  }

  return (
    <div className="flights-page">
      {/* Ambience (light glow kao na loginu) */}
      <div className="av-bg-lite" aria-hidden="true" />

      <div className="flights-container">
        <h1 className="flights-title">Pretraga letova</h1>
        <p className="flights-sub">Pronađi najbolje opcije za svoj sledeći let.</p>

        {/* Search form */}
        <form className="flights-form" onSubmit={onSubmit}>
          <label>
            <span>Origin</span>
            <input
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="BEG"
              maxLength={8}
            />
          </label>
          <label>
            <span>Destination</span>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="CDG"
              maxLength={8}
            />
          </label>
          <label>
            <span>Datum</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <button className="av-btn" type="submit" disabled={loading}>
            {loading ? "Tražim…" : "Pretraži"}
          </button>
        </form>

        {/* Error */}
        {err && <div className="error" role="alert">{err}</div>}

        {/* Results */}
        <div className="flights-grid">
          {loading && !data && <div className="loading">Učitavam letove…</div>}

          {data?.data?.length === 0 && !loading && (
            <div className="empty">Nema rezultata za zadate filtere.</div>
          )}

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
                  <button className="av-btn ghost">Detalji</button>
                  <button className="av-btn">Rezerviši</button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Pagination */}
        {data?.last_page > 1 && (
          <div className="pager">
            <button
              className="pill"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Prethodna
            </button>
            <span className="page-info">
              Strana {data.current_page} / {data.last_page}
            </span>
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
    </div>
  );
}
