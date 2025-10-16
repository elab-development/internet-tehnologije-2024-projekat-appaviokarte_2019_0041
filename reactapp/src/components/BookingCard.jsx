 
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
export default function BookingCard({
  b,
  confirmId,
  setConfirmId,
  onCancel,
  cancelLoading = false,
  cancelErr = "",
}) {
  const f = b.flight || {};
  const mins = minutesUntil(f.departure_at);
  const isCanceled = b.status === "canceled";
  const canCancel = !isCanceled && mins > 24 * 60;

  return (
    <article className={`bk-card ${isCanceled ? "is-canceled" : ""}`} tabIndex={0}>
      <div className="bk-head">
        <div className="bk-code">{b.booking_code || `#${b.id}`}</div>
        <div className="bk-status">
          {b.status === "confirmed" && <span className="badge ok">confirmed</span>}
          {b.status === "canceled"  && <span className="badge warn">canceled</span>}
        </div>
      </div>

      <div className="bk-route">
        <div className="leg">
          <div className="time">{fmtDateTime(f.departure_at)}</div>
          <div className="apt">
            <span className="apt-code">{f.origin?.code}</span>
            <span className="apt-name">{f.origin?.city}</span>
          </div>
        </div>

        <div className="line">
          <span className="dot" />
          <span className="bar" />
          <span className="plane">✈</span>
          <span className="bar" />
          <span className="dot" />
        </div>

        <div className="leg end">
          <div className="time">{fmtDateTime(f.arrival_at)}</div>
          <div className="apt">
            <span className="apt-code">{f.destination?.code}</span>
            <span className="apt-name">{f.destination?.city}</span>
          </div>
        </div>
      </div>

      <div className="bk-meta">
        <span className="badge seats">{b.passengers?.length || 0} putnik(a)</span>
        <span className="badge muted">Rezervisano: {fmtDateTime(b.booked_at)}</span>
        <span className="price">{fmtMoney(b.total_price)}</span>
      </div>

      <div className="bk-actions">
        {!isCanceled && (
          <span className="muted">
            Do poletanja: {mins <= 0 ? "poletelo" : `${Math.floor(mins / 60)}h ${mins % 60}m`}
          </span>
        )}

        {canCancel && (
          <button className="av-btn ghost" onClick={() => setConfirmId?.(b.id)}>
            Otkaži
          </button>
        )}
        {/* ako je canceled ili ≤24h, dugme se ne prikazuje */}
      </div>

      {confirmId === b.id && (
        <div className="bk-confirm">
          <div>Zaista želiš da otkažeš ovu rezervaciju?</div>
          <div className="actions">
            <button className="pill" onClick={() => setConfirmId?.(null)}>Ne</button>
            <button className="av-btn" onClick={onCancel} disabled={cancelLoading}>
              {cancelLoading ? "Otkazujem…" : "Da, otkaži"}
            </button>
          </div>
          {cancelErr && <div className="error" role="alert">{cancelErr}</div>}
        </div>
      )}
    </article>
  );
}
