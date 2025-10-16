import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "./bookings.css";
import BookingCard from "../components/BookingCard"; 

export default function MyBookingsPage() {
  const [data, setData] = useState(null);    
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
 
  const [confirmId, setConfirmId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelErr, setCancelErr] = useState("");

  const query = useMemo(() => `?page=${page}`, [page]);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get(`/api/bookings${query}`);
      setData(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Greška pri učitavanju rezervacija.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(); 
  }, [query]);

  const items = data?.data || [];
  const now = new Date();
  const upcoming = items.filter((b) => new Date(b.flight?.departure_at) > now);
  const past     = items.filter((b) => new Date(b.flight?.departure_at) <= now);

  async function cancelBooking(id) {
    setCancelLoading(true);
    setCancelErr("");
    try {
      await api.post(`/api/bookings/${id}/cancel`);
      setConfirmId(null);
      await load(); // refresh liste posle otkazivanja
    } catch (e) {
      setCancelErr(e?.response?.data?.message || "Otkazivanje nije uspelo.");
    } finally {
      setCancelLoading(false);
    }
  }

  return (
    <div className="bookings-page">
      <div className="av-bg-lite" aria-hidden="true" />

      <div className="bk-container">
        <h1 className="bk-title">Moje rezervacije</h1>
        <p className="bk-sub">Pregled budućih i prošlih rezervacija.</p>

        {err && <div className="error">{err}</div>}
        {loading && !data && <div className="loading">Učitavam…</div>}

        {/* Buduće rezervacije */}
        <section className="bk-section">
          <h2>Buduće</h2>
          <div className="bk-grid">
            {upcoming.length === 0 && !loading && (
              <div className="empty">Nema budućih rezervacija.</div>
            )}
            {upcoming.map((b) => (
              <BookingCard
                key={b.id}
                b={b}
                confirmId={confirmId}
                setConfirmId={setConfirmId}
                onCancel={() => cancelBooking(b.id)}
                cancelLoading={cancelLoading}
                cancelErr={cancelErr}
              />
            ))}
          </div>
        </section>

        {/* Prošle rezervacije */}
        <section className="bk-section">
          <h2>Prošle</h2>
          <div className="bk-grid">
            {past.length === 0 && !loading && (
              <div className="empty">Nema prošlih rezervacija.</div>
            )}
            {past.map((b) => (
              <BookingCard
                key={b.id}
                b={b}
                confirmId={confirmId}
                setConfirmId={setConfirmId}
                onCancel={() => cancelBooking(b.id)}
                cancelLoading={cancelLoading}
                cancelErr={cancelErr}
              />
            ))}
          </div>
        </section>

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
