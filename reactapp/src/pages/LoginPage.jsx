import React, { useState } from "react";
import api from "../api/axios"; // ako nemaš ovaj fajl, vidi napomenu iznad
import "./login.css";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await api.post("/api/login", { email, password });
      const { token, user } = res.data;

      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));

      onLogin?.(user, token);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        "Prijava nije uspela. Proveri email/lozinku i pokušaj ponovo.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="av-login">
      {/* ambient backdrop */}
      <div className="av-login-bg" />
      <div className="av-login-stars" />
      <div className="av-login-cloud c1" />
      <div className="av-login-cloud c2" />
      <div className="av-login-cloud c3" />

      {/* nav / brand */}
      <header className="av-login-nav">
        <div className="brand">
          <span className="logo">✈</span>
          <span>SkyReserve</span>
        </div>
        <nav className="links">
          <a href="/">Home</a>
          <a className="pill" href="/register">
            Create account
          </a>
        </nav>
      </header>

      {/* main */}
      <main className="av-login-main">
        <section className="welcome">
          <h1>Boarding starts here.</h1>
          <p>
            Uloguj se i otključaj najpovoljnije letove, pametne preporuke i
            fleksibilne rezervacije — bez turbulencija.
          </p>

          {/* avion + contrails */}
          <div className="plane-wrap" aria-hidden="true">
            <svg className="plane" viewBox="0 0 700 260" role="img" focusable="false">
              <defs>
                <linearGradient id="planeGrad" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#eef2ff" />
                  <stop offset="1" stopColor="#c7d2fe" />
                </linearGradient>
              </defs>

              {/* contrails */}
              <g className="contrails">
                <rect x="40" y="150" width="280" height="3" rx="2" />
                <rect x="40" y="165" width="230" height="2" rx="1" />
                <rect x="40" y="135" width="190" height="2" rx="1" />
              </g>

             
            </svg>
          </div>
        </section>

        {/* glass form card */}
        <section className="card">
          <div className="spark" aria-hidden="true" />
          <h2>Sign in</h2>
          <p className="sub">Nastavi svoje putovanje.</p>

          <form className="form" onSubmit={handleSubmit} noValidate>
            <label>
              <span>Email</span>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email"
              />
            </label>

            <label>
              <span>Lozinka</span>
              <div className="pass-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-label="Lozinka"
                />
                <button
                  type="button"
                  className="ghost toggle"
                  onClick={() => setShowPass((s) => !s)}
                  aria-label={showPass ? "Sakrij lozinku" : "Prikaži lozinku"}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {err && (
              <div className="error" role="alert">
                {err}
              </div>
            )}

            <button className="av-btn" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <button
              type="button"
              className="av-btn ghost"
              onClick={() => (window.location.href = "/forgot-password")}
            >
              Forgot password?
            </button>
          </form>

          <div className="fineprint">
            Nemate nalog? <a href="/register" className="link">Kreiraj nalog</a>
          </div>
        </section>
      </main>
  
    </div>
  );
}
