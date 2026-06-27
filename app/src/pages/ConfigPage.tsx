import { useState } from "react";
import { getBusinessConfig } from "../api";

const TIMEZONES = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
  "UTC",
];

const WEEKDAYS = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 7 },
];

const DURATIONS = [15, 30, 45, 60, 90, 120];

export default function ConfigPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [configLoaded, setConfigLoaded] = useState(false);
  const [description, setDescription] = useState("");
  const [form, setForm] = useState({
    timezone: "Asia/Kolkata",
    duration: 30,
    start_time: "09:00:00",
    end_time: "18:00:00",
    days: [1, 2, 3, 4, 5] as number[],
    excluded_days: [] as { day: string; message: string }[],
  });
  const [inputSmbId, setInputSmbId] = useState("");
  const [newHoliday, setNewHoliday] = useState({ day: "", message: "" });
  const [success, setSuccess] = useState(false);

  const fetchBusinessConfig = async () => {
  if (!inputSmbId.trim()) {
    setDescription("❌ Please enter SMB ID.");
    return;
  }

  try {
    setLoading(true);
    setError("");

    const data = await getBusinessConfig(inputSmbId.trim());

    setForm({
      timezone: data.timezone,
      duration: data.duration,
      start_time: data.start_time,
      end_time: data.end_time,
      days: data.days,
      excluded_days: (data.excluded_days || []).map(
        (d: { date: string; reason: string }) => ({
          day: d.date,
          message: d.reason,
        })
      ),
    });

    setInputSmbId(data.smb_id);
    setConfigLoaded(true);
    setDescription("✅ Business configuration loaded successfully.");
  } catch (err) {
    console.error(err);
    setConfigLoaded(true);
    setError("Unable to fetch business configuration.");
    setDescription("❌ Failed to fetch business configuration.");
  } finally {
    setLoading(false);
  }
};

const toggleDay = (value: number) => {
    setForm((current) => ({
      ...current,
      days: current.days.includes(value)
        ? current.days.filter((day) => day !== value)
        : [...current.days, value].sort(),
    }));
  };

  const addHoliday = () => {
    if (!newHoliday.day || !newHoliday.message.trim()) return;
    setForm((current) => ({
      ...current,
      excluded_days: [...current.excluded_days, { day: newHoliday.day, message: newHoliday.message.trim() }],
    }));
    setNewHoliday({ day: "", message: "" });
  };

  const handleSubmit = () => {
  setDescription("✅ Configuration saved.");
  console.log(success);
  setSuccess(true);

  setTimeout(() => {
    setSuccess(false);
    setDescription("");
  }, 3000);
};

  return (
    <div className="config-page">
      <p className="page-title">Business Configuration</p>
      <p className="page-subtitle">Manage the timezone, operating hours, working days, and holiday exclusions.</p>

      {error && <div className="alert alert-error">{error}</div>}
      {description && (
        <div className="alert alert-success">
          {description}
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <p className="section-label">Business Identity</p>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            className="form-input"
            placeholder="Paste SMB ID (UUID)"
            value={inputSmbId}
            onChange={(event) => setInputSmbId(event.target.value)}
            style={{ flex: 1 }}
          />

          <button
            className="btn btn-secondary"
            onClick={fetchBusinessConfig}
          >
            Configuration Details
          </button>

          {configLoaded && (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={form.days.length === 0}
            >
              {loading ? <span className="spinner" /> : null}
              Save Configuration
            </button>
          )}
        </div>
      </div>

    {configLoaded && (
      <div className="config-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <p className="section-label">Timezone</p>
            <div className="form-group">
              <label className="form-label">Business Timezone</label>
              <select
                className="form-select"
                value={form.timezone}
                onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))}
              >
                {TIMEZONES.map((timezone) => (
                  <option key={timezone} value={timezone}>{timezone}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="card">
            <p className="section-label">Business Hours</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Opens at</label>
                <input
                  type="time"
                  className="form-input"
                  value={form.start_time.slice(0, 5)}
                  onChange={(event) => setForm((current) => ({ ...current, start_time: `${event.target.value}:00` }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Closes at</label>
                <input
                  type="time"
                  className="form-input"
                  value={form.end_time.slice(0, 5)}
                  onChange={(event) => setForm((current) => ({ ...current, end_time: `${event.target.value}:00` }))}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Slot Duration</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {DURATIONS.map((duration) => (
                  <button
                    key={duration}
                    className={`day-chip ${form.duration === duration ? "selected" : ""}`}
                    onClick={() => setForm((current) => ({ ...current, duration }))}
                  >
                    {duration} min
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <p className="section-label">Active Weekdays</p>
            <div className="day-checkboxes">
              {WEEKDAYS.map((day) => (
                <button
                  key={day.value}
                  className={`day-chip ${form.days.includes(day.value) ? "selected" : ""}`}
                  onClick={() => toggleDay(day.value)}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <p className="section-label">Holiday Exclusions</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, marginBottom: 20 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={newHoliday.day}
                onChange={(event) => setNewHoliday((current) => ({ ...current, day: event.target.value }))}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Reason</label>
              <input
                className="form-input"
                placeholder="Christmas Day"
                value={newHoliday.message}
                onChange={(event) => setNewHoliday((current) => ({ ...current, message: event.target.value }))}
              />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button className="btn btn-secondary" onClick={addHoliday}>Add</button>
            </div>
          </div>

          <hr className="divider" />

          {form.excluded_days.length === 0 ? (
            <div className="empty-state">No holiday exclusions added.</div>
          ) : (
            <ul className="holiday-list">
              {form.excluded_days.map((holiday, index) => (
                <li key={`${holiday.day}-${index}`} className="holiday-row">
                  <div>
                    <span className="holiday-date">{holiday.day}</span>
                    <span className="holiday-msg">{holiday.message}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div> )}

      <style>{`
        .config-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 20px;
        }
        .holiday-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .holiday-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
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
        .empty-state {
          text-align: center;
          padding: 32px 0;
          color: var(--color-text-dim);
          font-size: 13px;
        }
        .small-btn { padding: 4px 10px; font-size: 12px; }
        @media (max-width: 768px) {
          .config-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
