import React from "react";
import { Link } from "react-router-dom";
import "./footer.css";

export default function Footer({ user }) {
  const year = new Date().getFullYear();
  const isAdmin = user?.role === "admin";

  return (
    <footer className="av-footer">
      <div className="av-footer-wrap">
        <div className="brand">
          <span className="logo">✈</span>
          <span>SkyReserve</span>
        </div>

        <nav className="cols">
          <div className="col">
            <h4>Explore</h4>
            <Link to="/letovi">Flights</Link>
            <Link to="/bookings">My bookings</Link>
            <Link to="/">Home</Link>
          </div>

          <div className="col">
            <h4>Support</h4>
            <a href="#">Help center</a>
            <a href="#">Contact</a>
            <a href="#">Privacy</a>
          </div>

          <div className="col">
            <h4>Account</h4>
            {!user && <Link to="/login">Sign in</Link>}
            {!user && <Link to="/register">Create account</Link>}
            {user && <span className="muted">Logged in as {user.name || user.email}</span>}
            {isAdmin && <Link to="/admin">Admin panel</Link>}
          </div>
        </nav>

        <div className="bottom">
          <p>© {year} SkyReserve — Smooth flights, smart fares.</p>
          <div className="social">
            <a aria-label="Twitter" href="#" title="Twitter">𝕏</a>
            <a aria-label="Instagram" href="#" title="Instagram">⃟</a>
            <a aria-label="LinkedIn" href="#" title="LinkedIn">in</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
