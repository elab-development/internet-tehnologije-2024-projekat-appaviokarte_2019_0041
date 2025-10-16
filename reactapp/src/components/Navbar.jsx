import React from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { logout as logoutApi } from "../api/auth";
import "../pages/login.css";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  async function handleLogout() {
    try { await logoutApi(); } catch {}
    finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      delete api.defaults.headers.common.Authorization;
      setUser?.(null);                // <<< osveži navbar odmah
      navigate("/login", { replace: true });
    }
  }

  return (
    <header className="av-topnav">
      <div className="brand">
        <Link to="/" className="brand-link">
          <span className="logo">✈</span>
          <span>SkyReserve</span>
        </Link>
      </div>

      <nav className="links">
        <Link to="/">Home</Link>
        <Link to="/letovi">Flights</Link>
        <Link to="/bookings">My bookings</Link>
      </nav>

      <div className="session">
        {user ? (
          <>
            <span className="who">{user.name || user.email}</span>
            <button className="av-btn ghost sm" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link className="pill" to="/login">Sign in</Link>
            <Link className="pill" to="/register">Create account</Link>
          </>
        )}
      </div>
    </header>
  );
}
