import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ako ne koristiš Router, vidi fallback ispod
import { register as registerApi } from "../api/auth";
import "./login.css";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const navigate = useNavigate(); // ako ne koristiš Router, možeš obrisati i koristiti samo window.location

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!name.trim()) return setErr("Unesite ime i prezime.");
    if (password.length < 6) return setErr("Lozinka mora imati najmanje 6 karaktera.");
    if (password !== confirm) return setErr("Lozinke se ne poklapaju.");

    setLoading(true);
    try {
      await registerApi(name.trim(), email.trim(), password); // backend vraća { user, token }
      // nakon uspešne registracije — vodi na login
      if (navigate) navigate("/login");
      else window.location.href = "/login"; // fallback ako nema react-router
    } catch (e2) {
      const msg =
        e2?.response?.data?.message ||
        e2?.response?.data?.errors?.email?.[0] ||
        "Registracija nije uspela. Proverite podatke i pokušajte ponovo.";
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

      {/* samo glavni sadržaj — bez navbara, bez footera, bez aviona */}
      <main className="av-login-main" style={{ gridTemplateColumns: "1fr" }}>
        <section className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
          <div className="spark" aria-hidden="true" />
          <h2>Create account</h2>
          <p className="sub">Završi registraciju za manje od minuta.</p>

          <form className="form" onSubmit={handleSubmit} noValidate>
            <label>
              <span>Ime i prezime</span>
              <input
                type="text"
                autoComplete="name"
                placeholder="Ana Avionović"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-label="Ime i prezime"
              />
            </label>

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
                  autoComplete="new-password"
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

            <label>
              <span>Potvrdi lozinku</span>
              <input
                type={showPass ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                aria-label="Potvrda lozinke"
              />
            </label>

            {err && (
              <div className="error" role="alert">
                {err}
              </div>
            )}

            <button className="av-btn" type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create account"}
            </button>

            <button
              type="button"
              className="av-btn ghost"
              onClick={() => (window.location.href = "/login")}
            >
              Već imaš nalog? Sign in
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
