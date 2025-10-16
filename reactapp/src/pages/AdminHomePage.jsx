 
import React from "react";
import { Link } from "react-router-dom";
import "./admin-home.css";

export default function AdminHomePage() {
  return (
    <div className="admin-home">
      <div className="av-bg-lite" aria-hidden="true" />

      <div className="ah-container">
        <header className="ah-header">
          <h1 className="ah-title">Admin konzola</h1>
          <p className="ah-sub">Izaberi sekciju kojom želiš da upravljaš.</p>
        </header>

        <div className="ah-grid">
          <article className="ah-card">
            <div className="spark" aria-hidden="true" />
            <h3>Letovi</h3>
            <p>Dodaj, izmeni ili obriši letove. Pretraga i paginacija.</p>
            <Link className="av-btn" to="/admin/flights">Otvori</Link>
          </article>

          <article className="ah-card">
            <div className="spark" aria-hidden="true" />
            <h3>Aerodromi</h3>
            <p>Upravljanje aerodromima + uvoz podataka iz eksternog API-ja.</p>
            <Link className="av-btn" to="/admin/airports">Otvori</Link>
          </article>

          <article className="ah-card">
            <div className="spark" aria-hidden="true" />
            <h3>Putnici</h3>
            <p>Pregled i izmena putnika po rezervacijama, sa paginacijom.</p>
            <Link className="av-btn" to="/admin/passengers">Otvori</Link>
          </article>
        </div>
      </div>
    </div>
  );
}
