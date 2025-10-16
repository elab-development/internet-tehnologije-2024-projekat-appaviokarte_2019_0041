import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Navbar from "./components/Navbar";
import FlightsPage from "./pages/FlightsPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import AdminFlightsPage from "./pages/AdminFlightsPage";
import AdminAirportsPage from "./pages/AdminAirportsPage";
import AdminPassengersPage from "./pages/AdminPassengersPage";
import AdminHomePage from "./pages/AdminHomePage";
import Footer from "./components/Footer";

 

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
        <Route path="/letovi" element={<FlightsPage />} /> 
          <Route path="/bookings" element={<MyBookingsPage />} />
        <Route path="/login" element={<LoginPage onLogin={(u)=>setUser(u)} />} />
        <Route path="/register" element={<RegisterPage onLogin={(u)=>setUser(u)} />} />
 
        <Route path="/admin/flights" element={<AdminFlightsPage />} />
        <Route path="/admin/airports" element={<AdminAirportsPage />} />
         <Route path="/admin/passengers" element={<AdminPassengersPage />} />
          <Route path="/admin" element={<AdminHomePage />} />x

            <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Footer></Footer>
    </BrowserRouter>
  );
}
