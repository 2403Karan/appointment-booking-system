import { useState } from "react";
import ConfigPage from "./pages/ConfigPage";
import BookingPage from "./pages/BookingPage";
import "./App.css";

type Page = "config" | "booking";

export default function App() {
  const [page, setPage] = useState<Page>("booking");

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-mark">L</span>
            <span className="logo-text">yftr</span>
            <span className="logo-tag">Scheduling</span>
          </div>
          <nav className="app-nav">
            <button
              className={`nav-btn ${page === "booking" ? "active" : ""}`}
              onClick={() => setPage("booking")}
            >
              Book Appointment
            </button>
            <button
              className={`nav-btn ${page === "config" ? "active" : ""}`}
              onClick={() => setPage("config")}
            >
              Business Config
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {page === "booking" ? <BookingPage /> : <ConfigPage />}
      </main>
    </div>
  );
}