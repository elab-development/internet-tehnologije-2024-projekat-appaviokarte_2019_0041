import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "./admin-airports.css";
 
const EXT_URL = "https://api.api-ninjas.com/v1/airports";
const EXT_KEY =  "ag23EGdc6Mp8KAFR8e9b0a2l5XXP4KdS7zFrPTV5";

const isIATA = (q) => /^[A-Za-z]{3}$/.test(q.trim());
const isICAO = (q) => /^[A-Za-z0-9]{4}$/.test(q.trim());

function mapExternalAirport(a) {
  // API Ninjas polja: { iata, icao, name, city, region, country (ISO2) ... }
  return {
    code: a?.iata || a?.icao || "",
    name: a?.name || "",
    city: a?.city || "",
    country: a?.country || "", // ISO-2 kod (npr. "GB"). Ako želiš puno ime, možeš mapirati naknadno.
    __raw: a,
  };
}

async function searchExternalAirports(q) {
  const s = q.trim().toUpperCase();
  if (!s) return [];

  // Free plan: dozvoljeni parametri su iata ili icao (name/city su premium)
  let queryParam = null;
  if (isIATA(s)) queryParam = `iata=${encodeURIComponent(s)}`;
  else if (isICAO(s)) queryParam = `icao=${encodeURIComponent(s)}`;
  else {
    // nije ni IATA (3) ni ICAO (4) — obavesti korisnika da unese kod
    const msg = "Free plan podržava pretragu po IATA (3 slova) ili ICAO (4).";
    throw new Error(msg);
  }

  const res = await fetch(`${EXT_URL}?${queryParam}`, {
    headers: { "X-Api-Key": EXT_KEY },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "External API error");
  }
  const json = await res.json();
  const list = Array.isArray(json) ? json : [];
  return list.map(mapExternalAirport).filter((x) => !!x.code);
}

/** ------------------------ Modal ---------------------------- */
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

/** --------------------------- Stranica ------------------------------------ */
export default function AdminAirportsPage() {
  // lokalni DB prikaz
  const [allAirports, setAllAirports] = useState([]); // iz /api/airports
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // filter za lokalne (server već podržava q=)
  const [q, setQ] = useState("");
  const [serverQuery, setServerQuery] = useState("");

  // client-side paginacija (pošto /api/airports vraća do 100)
  const [page, setPage] = useState(1);
  const perPage = 12;
  const filtered = useMemo(() => allAirports, [allAirports]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  // form modali
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ code: "", name: "", city: "", country: "" });
  const [formErr, setFormErr] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // delete modal
  const [delId, setDelId] = useState(null);
  const [delLoading, setDelLoading] = useState(false);
  const [delErr, setDelErr] = useState("");

  // eksterni search
  const [extQ, setExtQ] = useState("");
  const [extLoading, setExtLoading] = useState(false);
  const [extErr, setExtErr] = useState("");
  const [extItems, setExtItems] = useState([]);

  async function loadAirports() {
    setLoading(true);
    setErr("");
    try {
      // koristi server filter q= (vraća do 100)
      const res = await api.get(
        `/api/airports?q=${encodeURIComponent(serverQuery || "")}`
      );
      setAllAirports(res.data || []);
      setPage(1);
    } catch (e) {
      setErr(e?.response?.data?.message || "Greška pri učitavanju aerodroma.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadAirports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverQuery]);

  function openCreate() {
    setEditId(null);
    setForm({ code: "", name: "", city: "", country: "" });
    setFormErr("");
    setShowForm(true);
  }
  function openEdit(a) {
    setEditId(a.id);
    setForm({
      code: a.code || "",
      name: a.name || "",
      city: a.city || "",
      country: a.country || "",
    });
    setFormErr("");
    setShowForm(true);
  }

  async function submitForm(e) {
    e?.preventDefault?.();
    setFormErr("");
    if (!form.code.trim())
      return setFormErr("Unesi IATA/ICAO kod aerodroma.");
    if (!form.name.trim()) return setFormErr("Unesi naziv aerodroma.");

    setFormLoading(true);
    try {
      if (editId) {
        await api.put(`/api/admin/airports/${editId}`, {
          code: form.code.trim(),
          name: form.name.trim(),
          city: form.city.trim() || null,
          country: form.country.trim() || null,
        });
      } else {
        await api.post(`/api/admin/airports`, {
          code: form.code.trim(),
          name: form.name.trim(),
          city: form.city.trim() || null,
          country: form.country.trim() || null,
        });
      }
      setShowForm(false);
      await loadAirports();
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
      await api.delete(`/api/admin/airports/${delId}`);
      setDelId(null);
      await loadAirports();
    } catch (e) {
      setDelErr(e?.response?.data?.message || "Brisanje nije uspelo.");
    } finally {
      setDelLoading(false);
    }
  }

  async function runExternalSearch() {
    setExtLoading(true);
    setExtErr("");
    setExtItems([]);
    try {
      if (!EXT_KEY) {
        throw new Error(
          "Nije podešen API ključ. Dodaj VITE_API_NINJAS_KEY u .env."
        );
      }
      const list = await searchExternalAirports(extQ);
      setExtItems(list.slice(0, 50)); // limit prikaza
    } catch (e) {
      setExtErr(
        e?.message ||
          "Eksterni API nije dostupan ili je došlo do greške."
      );
    } finally {
      setExtLoading(false);
    }
  }

  function importExternal(a) {
    setEditId(null);
    setForm({
      code: a.code || "",
      name: a.name || "",
      city: a.city || "",
      country: a.country || "",
    });
    setShowForm(true);
  }

  return (
    <div className="admin-airports-page">
      <div className="av-bg-lite" aria-hidden="true" />

      <div className="aa-container">
        <div className="aa-header">
          <div>
            <h1 className="aa-title">Admin · Aerodromi</h1>
            <p className="aa-sub">Upravljanje aerodromima + uvoz iz spoljnog API-ja.</p>
          </div>
          <div className="aa-actions">
            <button className="av-btn" onClick={openCreate}>
              + Novi aerodrom
            </button>
          </div>
        </div>

        {/* Top bar */}
        <div className="aa-top">
          {/* Lokalna pretraga (server) */}
          <form
            className="aa-filters"
            onSubmit={(e) => {
              e.preventDefault();
              setServerQuery(q);
            }}
          >
            <label className="field">
              <span>Pretraga (lokalno)</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="kod / ime / grad / država"
              />
            </label>
            <div className="filter-actions">
              <button className="av-btn" type="submit">
                Primeni
              </button>
              <button
                className="av-btn ghost"
                type="button"
                onClick={() => {
                  setQ("");
                  setServerQuery("");
                }}
              >
                Reset
              </button>
            </div>
          </form>

          {/* Eksterni import: API Ninjas (free: IATA/ICAO) */}
          <div className="aa-import">
            <div className="import-row">
              <input
                className="imp-input"
                value={extQ}
                onChange={(e) => setExtQ(e.target.value)}
                placeholder="Unesi IATA (3 slova) ili ICAO (4) za uvoz…"
              />
              <button
                className="av-btn"
                onClick={runExternalSearch}
                disabled={extLoading || !extQ.trim()}
              >
                {extLoading ? "Tražim…" : "Pretraži"}
              </button>
            </div>
            <div className="hint">
              Free plan dozvoljava pretragu samo po <b>IATA</b> (npr. <code>LHR</code>) ili
              <b> ICAO</b> (npr. <code>EGLL</code>). Za ime/gradu potreban je premium.
            </div>
            {extErr && <div className="error">{extErr}</div>}

            {extItems.length > 0 && (
              <div className="ext-list">
                {extItems.map((a, i) => (
                  <div key={`${a.code}-${i}`} className="ext-item">
                    <div className="ext-main">
                      <span className="code">{a.code}</span>
                      <span className="name">{a.name}</span>
                    </div>
                    <div className="ext-sub">
                      {a.city}
                      {a.city && a.country ? ", " : ""}
                      {a.country}
                    </div>
                    <div className="ext-actions">
                      <button className="pill" onClick={() => importExternal(a)}>
                        Add to DB
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lista lokalnih aerodroma */}
        {err && <div className="error" role="alert">{err}</div>}
        {loading && allAirports.length === 0 && <div className="loading">Učitavam…</div>}

        <div className="table-wrap">
          <table className="aa-table">
            <thead>
              <tr>
                <th>Kod</th>
                <th>Naziv</th>
                <th>Grad</th>
                <th>Država</th>
                <th style={{ width: 120 }}>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="empty">Nema rezultata.</td>
                </tr>
              )}
              {pageItems.map((a) => (
                <tr key={a.id}>
                  <td className="mono">{a.code}</td>
                  <td>{a.name}</td>
                  <td>{a.city}</td>
                  <td>{a.country}</td>
                  <td className="actions">
                    <button className="pill" onClick={() => openEdit(a)}>Izmeni</button>
                    <button className="pill danger" onClick={() => setDelId(a.id)}>Obriši</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginacija (client-side) */}
        {totalPages > 1 && (
          <div className="pager">
            <button
              className="pill"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Prethodna
            </button>
            <span className="page-info">
              Strana {page} / {totalPages}
            </span>
            <button
              className="pill"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Sledeća →
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      {showForm && (
        <Modal
          title={editId ? "Izmeni aerodrom" : "Novi aerodrom"}
          onClose={() => setShowForm(false)}
        >
          <form className="aa-form" onSubmit={submitForm}>
            <div className="grid2">
              <label className="field">
                <span>Kod (IATA/ICAO)</span>
                <input
                  value={form.code}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, code: e.target.value.toUpperCase() }))
                  }
                  maxLength={8}
                  placeholder="BEG"
                  required
                />
              </label>
              <label className="field">
                <span>Naziv</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Nikola Tesla Airport"
                  required
                />
              </label>
            </div>

            <div className="grid2">
              <label className="field">
                <span>Grad</span>
                <input
                  value={form.city}
                  onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))}
                  placeholder="Belgrade"
                />
              </label>
              <label className="field">
                <span>Država</span>
                <input
                  value={form.country}
                  onChange={(e) => setForm((s) => ({ ...s, country: e.target.value }))}
                  placeholder="RS"
                />
              </label>
            </div>

            {formErr && <div className="error" role="alert">{formErr}</div>}

            <div className="modal-actions">
              <button
                type="button"
                className="av-btn ghost"
                onClick={() => setShowForm(false)}
              >
                Otkaži
              </button>
              <button type="submit" className="av-btn" disabled={formLoading}>
                {formLoading ? "Čuvam…" : editId ? "Sačuvaj izmene" : "Kreiraj"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirm */}
      {delId && (
        <Modal title="Obriši aerodrom" onClose={() => setDelId(null)}>
          <div className="confirm-box">
            <p>Da li sigurno želiš da obrišeš ovaj aerodrom?</p>
            {delErr && <div className="error" role="alert">{delErr}</div>}
            <div className="modal-actions">
              <button className="av-btn ghost" onClick={() => setDelId(null)}>
                Ne
              </button>
              <button
                className="av-btn danger"
                onClick={confirmDelete}
                disabled={delLoading}
              >
                {delLoading ? "Brišem…" : "Da, obriši"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
