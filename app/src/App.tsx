import { NavLink, Route, Routes } from "react-router-dom";
import BookingPage from "./pages/BookingPage";
import ConfigPage from "./pages/ConfigPage";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-mark">ABS</span>
            <span className="logo-text">Appointment Booking System</span>
          </div>

          <nav className="app-nav">
            <NavLink
              to="/booking"
              className={({ isActive }) =>
                `nav-btn ${isActive ? "active" : ""}`
              }
            >
              Book Appointment
            </NavLink>

            <NavLink
              to="/config"
              className={({ isActive }) =>
                `nav-btn ${isActive ? "active" : ""}`
              }
            >
              Business Config
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/config" element={<ConfigPage />} />
        </Routes>
      </main>
    </div>
  );
}