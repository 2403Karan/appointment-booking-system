import { useState, useEffect } from "react";
import { useConfig } from "../hooks/useConfig";
import type { SMBConfig } from "../types";

const TIMEZONES = [
  "Asia/Kolkata", "America/New_York", "America/Chicago",
  "America/Denver", "America/Los_Angeles", "Europe/London",
  "Europe/Paris", "Asia/Tokyo", "Asia/Singapore",
  "Australia/Sydney", "UTC",
];

const WEEKDAYS = [
  { label: "Mon", value: 1 }, { label: "Tue", value: 2 },
  { label: "Wed", value: 3 }, { label: "Thu", value: 4 },
  { label: "Fri", value: 5 }, { label: "Sat", value: 6 },
  { label: "Sun", value: 7 },
];

const DURATIONS = [15, 30, 45, 60, 90, 120];

export default function ConfigPage() {
  const { config, loading, error, smbId, setSmbId, save } = useConfig();

  const [form, setForm] = useState({
    timezone: "Asia/Kolkata",
    duration: 30,
    start_time: "09:00:00",
    end_time: "18:00:00",
    days: [1, 2, 3, 4, 5] as number[],
    excluded_days: [] as { day: string; message: string }[],
  });

  const [inputSmbId, setInputSmbId] = useState(smbId);
  const [newHoliday, setNewHoliday] = useState({ day: "", message: "" });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (config) {
      setForm({
        timezone: config.timezone,
        duration: config.duration,
        start_time: config.start_time,
        end_time: config.end_time,
        days: config.days.split(",").map(Number),
        excluded_days: config.excluded_days?.days || [],
      });
    }
  }, [config]);

  const toggleDay = (val: number) => {
    setForm((f) => ({
      ...f,
      days: f.days.includes(val) ? f.days.filter((d) => d !== val) : [...f.days, val].sort(),
    }));
  };

  const addHoliday = () => {
    if (!newHoliday.day || !newHoliday.message) return;
    setForm((f) => ({
      ...f,
      excluded_days: [...f.excluded_days, { ...newHoliday }],
    }));
    setNewHoliday({ day: "", message: "" });
  };

  const removeHoliday = (i: number) => {
    setForm((f) => ({
      ...f,
      excluded_days: f.excluded_days.filter((_, idx) => idx !== i),
    }));
  };

  const handleSubmit = async () => {
    setSuccess(false);
    const payload: Omit<SMBConfig, "smb_id"> = {
      timezone: form.timezone,
      duration: form.duration,
      start_time: form.start_time,
      end_time: form.end_time,
      days: form.days.join(","),
      excluded_days: { days: form.excluded_days },
    };
    try {
      await save(payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {}
  };

  return (
    <div className="config-page">
      <p className="page-title">Business Configuration</p>
      <p className="page-subtitle">Set your timezone, hours, working days and holiday closures.</p>

      {/* Load existing config */}
      <div className="card" style={{ marginBottom: 20 }}>
        <p className="section-label">Load existing config</p>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            className="form-input"
            placeholder="Paste SMB ID (UUID)…"
            value={inputSmbId}
            onChange={(e) => setInputSmbId(e.target.value)}
          />
          <button className="btn btn-secondary" onClick={() => setSmbId(inputSmbId)} style={{ whiteSpace: "nowrap" }}>
            Load
          </button>
        </div>
        {config && (
          <p style={{ marginTop: 8, fontSize: 12, color: "var(--color-success)" }}>
            ✓ Loaded config for <code style={{ fontFamily: "var(--font-mono)" }}>{config.smb_id}</code>
          </p>
        )}
      </div>

      {error && <div className="alert alert-error">⚠ {error}</div>}
      {success && <div className="alert alert-success">✓ Configuration saved successfully!</div>}

      <div className="config-grid">
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Timezone */}
          <div className="card">
            <p className="section-label">Timezone</p>
            <div className="form-group">
              <label className="form-label">Business Timezone</label>
              <select
                className="form-select"
                value={form.timezone}
                onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Business Hours */}
          <div className="card">
            <p className="section-label">Business Hours</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Opens at</label>
                <input
                  type="time"
                  className="form-input"
                  value={form.start_time.slice(0, 5)}
                  onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value + ":00" }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Closes at</label>
                <input
                  type="time"
                  className="form-input"
                  value={form.end_time.slice(0, 5)}
                  onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value + ":00" }))}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Slot Duration</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    className={`day-chip ${form.duration === d ? "selected" : ""}`}
                    onClick={() => setForm((f) => ({ ...f, duration: d }))}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Working Days */}
          <div className="card">
            <p className="section-label">Working Days</p>
            <div className="day-checkboxes">
              {WEEKDAYS.map((d) => (
                <button
                  key={d.value}
                  className={`day-chip ${form.days.includes(d.value) ? "selected" : ""}`}
                  onClick={() => toggleDay(d.value)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — Holidays */}
        <div className="card">
          <p className="section-label">Holiday Exclusions</p>
          <p style={{ fontSize: 12, color: "var(--color-text-sub)", marginBottom: 16 }}>
            Appointments cannot be booked on these dates.
          </p>

          {/* Add holiday */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, marginBottom: 20 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={newHoliday.day}
                onChange={(e) => setNewHoliday((h) => ({ ...h, day: e.target.value }))}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Reason</label>
              <input
                className="form-input"
                placeholder="e.g. Christmas Day"
                value={newHoliday.message}
                onChange={(e) => setNewHoliday((h) => ({ ...h, message: e.target.value }))}
              />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button className="btn btn-secondary" onClick={addHoliday}>Add</button>
            </div>
          </div>

          <hr className="divider" />

          {form.excluded_days.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-text-dim)", fontSize: 13 }}>
              No holidays added yet
            </div>
          ) : (
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {form.excluded_days.map((h, i) => (
                <li key={i} className="holiday-row">
                  <div>
                    <span className="holiday-date">{h.day}</span>
                    <span className="holiday-msg">{h.message}</span>
                  </div>
                  <button className="btn btn-danger" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => removeHoliday(i)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <span className="spinner" /> : null}
          {config ? "Update Configuration" : "Create Configuration"}
        </button>
      </div>

      <style>{`
        .config-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 768px) {
          .config-grid { grid-template-columns: 1fr; }
        }
        .holiday-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--color-surface-2);
          border: 1px solid var(--color-border-soft);
          border-radius: var(--radius-sm);
        }
        .holiday-date {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--color-accent);
          margin-right: 12px;
        }
        .holiday-msg { font-size: 13px; color: var(--color-text-sub); }
      `}</style>
    </div>
  );
}