import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Navbar from "./components/Navbar";

function Flights() {
  return <div style={{ padding: 24 }}>Letovi – lista letova (WIP)</div>;
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("auth_user") || "null"); }
    catch { return null; }
  });

  // sync ako se login/logout desi u drugom tabu
  useEffect(() => {
    const onStorage = () => {
      try { setUser(JSON.parse(localStorage.getItem("auth_user") || "null")); }
      catch { setUser(null); }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <BrowserRouter>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/letovi" element={<Flights />} />
        <Route path="/bookings" element={<div style={{padding:24}}>Moje rezervacije (WIP)</div>} />

        <Route path="/login" element={<LoginPage onLogin={(u)=>setUser(u)} />} />
        <Route path="/register" element={<RegisterPage onLogin={(u)=>setUser(u)} />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
