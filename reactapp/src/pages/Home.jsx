import React, { useState } from "react";
import "./home.css";

export default function Home() {
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    date: "",
    pax: 1,
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSearch = (e) => {
    e.preventDefault();
    // TODO: pozovi backend: GET /api/flights/search?origin=...&destination=...&date=...
    console.log("SEARCH:", form);
  };

  return (
    <div className="av-home">
      {/* pozadina + dekor */}
      <div className="av-bg" />
      <div className="av-stars" aria-hidden />
      <div className="av-cloud c1" aria-hidden />
      <div className="av-cloud c2" aria-hidden />
      <div className="av-cloud c3" aria-hidden />

      <header className="av-nav">
        <div className="av-brand">
          <span className="av-logo" aria-hidden>✈</span> Skypath
        </div>
        <nav className="av-links">
          <a href="#dest">Destinacije</a>
          <a href="#why">Zašto mi?</a>
          <a href="#cta" className="pill">Rezerviši</a>
        </nav>
      </header>

      <main className="av-main">
        <section className="av-hero">
          <div className="av-hero-copy">
            <h1>Leti lakše.<br/>Rezerviši brže.</h1>
            <p>
              Pronađi savršen let — pametna pretraga, transparentne cene i
              jednostavna rezervacija u par klikova.
            </p>
          </div>

          <form className="av-form" onSubmit={onSearch}>
            <div className="row">
              <label>
                Polazak
                <input
                  name="origin"
                  placeholder="npr. BEG"
                  value={form.origin}
                  onChange={onChange}
                  required
                />
              </label>
              <label>
                Dolazak
                <input
                  name="destination"
                  placeholder="npr. CDG"
                  value={form.destination}
                  onChange={onChange}
                  required
                />
              </label>
            </div>
            <div className="row">
              <label>
                Datum
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={onChange}
                  required
                />
              </label>
              <label>
                Putnika
                <input
                  type="number"
                  min="1"
                  max="9"
                  name="pax"
                  value={form.pax}
                  onChange={onChange}
                  required
                />
              </label>
            </div>
            <button className="av-btn" type="submit">
              Pretraži letove
            </button>
          </form>

          <AirplaneIllustration />
        </section>

        <section id="why" className="av-grid">
          <Feature
            title="Pametna pretraga"
            text="Filtriraj po ceni, trajanju, broju presedanja i avio-kompaniji."
          />
          <Feature
            title="Fleks datumi"
            text="Pogledaj najpovoljnije dane u nedelji — uštedi vreme i novac."
          />
          <Feature
            title="Bez skrivenih troškova"
            text="Transparentno od prve do poslednje stavke."
          />
        </section>

        <section id="dest" className="av-cards">
          <Card city="Pariz" code="CDG" img="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1400&auto=format&fit=crop" />
          <Card city="Istanbul" code="IST" img="https://images.unsplash.com/photo-1505764706515-aa95265c5abc?q=80&w=1400&auto=format&fit=crop" />
          <Card city="Dubai" code="DXB" img="https://images.unsplash.com/photo-1504805572947-34fad45aed93?q=80&w=1400&auto=format&fit=crop" />
          <Card city="Amsterdam" code="AMS" img="https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?q=80&w=1400&auto=format&fit=crop" />
        </section>

        <section id="cta" className="av-cta">
          <h2>Spreman/na za poletanje?</h2>
          <p>Prijavi se i započni rezervaciju u par sekundi.</p>
          <div className="cta-actions">
            <button className="av-btn">Kreiraj nalog</button>
            <button className="av-btn ghost">Uloguj se</button>
          </div>
        </section>
      </main>

      <footer className="av-foot">
        © {new Date().getFullYear()} Skypath — Leti pametno.
      </footer>
    </div>
  );
}

/* ———— DODATNE KOMPONENTE ———— */

function Feature({ title, text }) {
  return (
    <div className="av-feature">
      <div className="spark" aria-hidden />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Card({ city, code, img }) {
  return (
    <article className="av-card" role="button" tabIndex={0}>
      <img src={img} alt={`${city} (${code})`} loading="lazy" />
      <div className="av-card-info">
        <h4>{city}</h4>
        <span>{code}</span>
      </div>
    </article>
  );
}

function AirplaneIllustration() {
  return (
    <div className="av-plane-wrap" aria-hidden>
      <svg className="av-plane" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
        <g className="body">
          <path d="M10,45 L120,40 C150,38 170,42 185,45 C190,46 192,50 190,52 C170,65 130,70 95,66 L10,60 Z" />
        </g>
        <g className="wing">
          <path d="M60,40 L105,20 L115,22 L80,42 Z" />
        </g>
        <g className="tail">
          <path d="M25,47 L20,30 L30,33 L35,48 Z" />
        </g>
        <circle className="window" cx="85" cy="49" r="2.2" />
        <circle className="window" cx="95" cy="49" r="2.2" />
        <circle className="window" cx="105" cy="49" r="2.2" />
      </svg>
    </div>
  );
}
