 
import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { logout as logoutApi } from "../api/auth";
import "../pages/login.css";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  async function handleLogout() {
    try { await logoutApi(); } catch {}
    finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      delete api.defaults.headers.common.Authorization;
      setUser?.(null);
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
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/letovi">Flights</NavLink>

        {/* samo za ulogovane korisnike */}
        {user && <NavLink to="/bookings">My bookings</NavLink>}

        {/* admin linkovi */}
        {isAdmin && (
          <>
            <span className="divider" aria-hidden="true" />
            <NavLink to="/admin" end>Admin</NavLink>
            <NavLink to="/admin/flights">Flights (Admin)</NavLink>
            <NavLink to="/admin/airports">Airports</NavLink>
            <NavLink to="/admin/passengers">Passengers</NavLink>
          </>
        )}
      </nav>

      <div className="session">
        {user ? (
          <>
            <span className="who">{user.name || user.email}</span>
            <button className="av-btn ghost sm" onClick={handleLogout}>
              Logout
            </button>
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
