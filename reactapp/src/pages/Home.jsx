import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  
import "./home.css"; 

export default function Home() {
  const navigate = useNavigate();  
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

    // minimalna validacija + normalizacija
    const origin = form.origin.trim().toUpperCase();
    const destination = form.destination.trim().toUpperCase();
    const date = form.date; // yyyy-mm-dd
    const pax = Math.max(1, Number(form.pax) || 1);

    if (!origin || !destination || !date) return;

    // formiraj query i preusmeri na stranicu sa rezultatima
    const qs = new URLSearchParams({ origin, destination, date, pax: String(pax) });
    navigate(`/flights?${qs.toString()}`); // ako ti je ruta /letovi, promeni ovde
  };

  return (
    <div className="av-home">
      {/* pozadina + dekor */}
      <div className="av-bg" />
      <div className="av-stars" aria-hidden />
      <div className="av-cloud c1" aria-hidden />
      <div className="av-cloud c2" aria-hidden />
      <div className="av-cloud c3" aria-hidden />

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

        </section>

        {/* … ostalo ostaje isto … */}
        <section id="why" className="av-grid">
          <Feature title="Pametna pretraga" text="Filtriraj po ceni, trajanju, broju presedanja i avio-kompaniji." />
          <Feature title="Fleks datumi" text="Pogledaj najpovoljnije dane u nedelji — uštedi vreme i novac." />
          <Feature title="Bez skrivenih troškova" text="Transparentno od prve do poslednje stavke." />
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
            <button className="av-btn" onClick={() => navigate("/register")}>Kreiraj nalog</button>
            <button className="av-btn ghost" onClick={() => navigate("/login")}>Uloguj se</button>
          </div>
        </section>
      </main>

  
    </div>
  );
}

/* ———— DODATNE KOMPONENTE ———— */
function Feature({ title, text }) { /* ...bez izmene... */ return (
  <div className="av-feature">
    <div className="spark" aria-hidden />
    <h3>{title}</h3>
    <p>{text}</p>
  </div>
);}

function Card({ city, code, img }) {
  return (
    <article
      className="av-card"
      role="button"
      tabIndex={0}
      onClick={() => {
        // klik na karticu može odmah da prebaci na rezultate za taj city/code (po želji)
        const qs = new URLSearchParams({ destination: code });
        window.location.href = `/flights?${qs.toString()}`;
      }}
    >
      <img src={img} alt={`${city} (${code})`} loading="lazy" />
      <div className="av-card-info">
        <h4>{city}</h4>
        <span>{code}</span>
      </div>
    </article>
  );
}

 
