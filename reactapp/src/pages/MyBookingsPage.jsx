import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "./bookings.css"; 
import { jsPDF } from "jspdf"; 
import { BookingCard } from "../components/BookingCard";

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
                onPdf={() => downloadTicketPDF(b)}    
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
                onPdf={() => downloadTicketPDF(b)}   // <<< DODATO
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

function fmtDateTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit"
  });
}
function minutesUntil(ts) {
  return Math.round((new Date(ts) - new Date()) / 60000);
}
function fmtMoney(n) {
  const v = Number(n) || 0;
  return v.toFixed(2) + " €";
} 

function downloadTicketPDF(b) {
  if (!b) return;
  const f = b.flight || {};
  const paxArr = Array.isArray(b.passengers) ? b.passengers : [];
  const mainPax = paxArr[0];
  const paxName = mainPax
    ? `${mainPax.first_name || ""} ${mainPax.last_name || ""}`.trim()
    : "Passenger";
  const extra = paxArr.length > 1 ? ` +${paxArr.length - 1}` : "";

  const dep = new Date(f.departure_at);
  const arr = new Date(f.arrival_at);

  const fmtD = (d) =>
    isFinite(d) ? d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" }) : "-";
  const fmtT = (d) =>
    isFinite(d) ? d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false }) : "-";

  // A6 landscape – kompaktan ticket bez praznog prostora
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a6" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // pozadina do ivica
  doc.setFillColor(11, 21, 53);
  doc.rect(0, 0, W, H, "F");

  // "kartica" sa zaobljenim uglovima
  const pad = 5;
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.25);
  doc.roundedRect(pad, pad, W - pad * 2, H - pad * 2, 5, 5, "S");

  // perforacija i stub
  const cutX = W * 0.7;
  doc.setLineDash([1, 1], 0);
  doc.line(cutX, pad + 3, cutX, H - pad - 3);
  doc.setLineDash([]);

  // naslov
  doc.setTextColor(230, 236, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("BOARDING PASS", pad + 6, pad + 12);

  // route
  doc.setFontSize(28);
  doc.text((f.origin?.code || "---").toUpperCase(), pad + 6, pad + 30);
  doc.setFontSize(10);
  doc.text("to", pad + 42, pad + 22);
  doc.setFontSize(28);
  doc.text((f.destination?.code || "---").toUpperCase(), pad + 50, pad + 30);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(170, 190, 255);
  doc.setFontSize(9);
  doc.text(f.origin?.city || "", pad + 6, pad + 36);
  doc.text(f.destination?.city || "", pad + 50, pad + 36);

  // levo: info
  labelVal(doc, "FLIGHT", f.code || "-", pad + 6, pad + 48);
  labelVal(doc, "PNR", b.booking_code || `#${b.id}`, pad + 50, pad + 48);
  labelVal(doc, "DATE", fmtD(dep), pad + 6, pad + 60);
  labelVal(doc, "DEPART", fmtT(dep), pad + 34, pad + 60);
  labelVal(doc, "ARRIVE", fmtT(arr), pad + 64, pad + 60);

  const seats = paxArr.map(p => p.seat || p.seat_number).filter(Boolean).join(", ");
  labelVal(doc, "PASSENGER", (paxName + extra).trim(), pad + 6, pad + 72);
  labelVal(doc, "SEAT(S)", seats || "—", pad + 64, pad + 72);

  // desni stub
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(230, 236, 255);
  doc.text("SkyReserve", cutX + 6, pad + 12);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(170, 190, 255);
  doc.text("Your smart flight partner", cutX + 6, pad + 18);

  labelVal(doc, "FLIGHT", f.code || "-", cutX + 6, pad + 32, 7, 11);
  labelVal(doc, "DATE", fmtD(dep), cutX + 6, pad + 42, 7, 11);
  labelVal(doc, "TIME", fmtT(dep), cutX + 6, pad + 52, 7, 11);

  // barcode kroz celu širinu stub-a
  drawBarcode(doc, cutX + 6, H - pad - 16, (W - pad - 6) - (cutX + 6), 10, b.booking_code || `${b.id}`);

  // watermark CANCELED
  if (b.status === "canceled") {
    doc.setGState(new doc.GState({ opacity: 0.9 }));
    doc.setTextColor(255, 180, 180);
    doc.setFont("helvetica", "bold"); doc.setFontSize(26);
    doc.text("CANCELED", pad + 8, H / 2, { angle: -10 });
    doc.setGState(new doc.GState({ opacity: 1 }));
  }

  const name = `ticket_${(b.booking_code || `#${b.id}`).replace(/\W+/g, "")}.pdf`;
  doc.save(name);

  // helpers
  function labelVal(doc, label, value, x, y, ls = 7, vs = 12) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(ls);
    doc.setTextColor(140, 200, 255); doc.text(String(label).toUpperCase(), x, y);
    doc.setFont("helvetica", "normal"); doc.setFontSize(vs);
    doc.setTextColor(230, 236, 255); doc.text(String(value || "-"), x, y + 5);
  }
  function drawBarcode(doc, x, y, w, h, data = "") {
    let seed = 0; for (let i = 0; i < data.length; i++) seed = (seed * 131 + data.charCodeAt(i)) >>> 0;
    const N = 70, bw = w / N;
    doc.setFillColor(255, 255, 255);
    for (let i = 0; i < N; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      if ((seed & 0xff) > 128) {
        const bh = h * (0.6 + ((i % 4) * 0.1));
        doc.rect(x + i * bw, y + (h - bh), bw * 0.82, bh, "F");
      }
    }
  }
}


function labeled(doc, label, value, x, y, labelSize = 7, valueSize = 12) {
  doc.setFont("helvetica", "bold"); doc.setFontSize(labelSize);
  doc.setTextColor(140, 200, 255);
  doc.text(String(label).toUpperCase(), x, y);
  doc.setFont("helvetica", "normal"); doc.setFontSize(valueSize);
  doc.setTextColor(230, 236, 255);
  doc.text(String(value || "-"), x, y + 5);
}

function drawBarcode(doc, x, y, w, h, data = "") {
  // pseudo pattern
  let seed = 0;
  for (let i = 0; i < data.length; i++) seed = (seed * 131 + data.charCodeAt(i)) >>> 0;
  const len = 60;
  const barW = w / len;
  doc.setFillColor(255, 255, 255);
  for (let i = 0; i < len; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    if ((seed & 0xff) > 128) {
      const bh = h * (0.75 + ((i % 3) * 0.1));
      doc.rect(x + i * barW, y + (h - bh), barW * 0.8, bh, "F");
    }
  }
}

