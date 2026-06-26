import { useState, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useConfig } from "../hooks/useConfig";
import { useSlots } from "../hooks/useSlots";
import CalendarGrid from "../components/calendar/CalendarGrid";
import BookingModal from "../components/booking/BookingModal";
import type { Slot } from "../types";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function BookingPage() {
  const { config, smbId, setSmbId } = useConfig();
  const tz = config?.timezone || "UTC";
  const { slots, loading, error, fetchSlots } = useSlots(smbId, tz);

  const [weekStart, setWeekStart] = useState(() => dayjs().tz(tz || "UTC").startOf("week"));
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [success, setSuccess] = useState(false);
  const [inputSmbId, setInputSmbId] = useState(smbId);

  // Re-anchor week start when timezone changes
  useEffect(() => {
    setWeekStart(dayjs().tz(tz).startOf("week"));
  }, [tz]);

  useEffect(() => {
    if (smbId) fetchSlots(weekStart);
  }, [smbId, weekStart]);

  const prevWeek = () => setWeekStart((w) => w.subtract(1, "week"));
  const nextWeek = () => setWeekStart((w) => w.add(1, "week"));

  const handleSuccess = () => {
    setSelectedSlot(null);
    setSuccess(true);
    fetchSlots(weekStart);
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div>
      <p className="page-title">Book an Appointment</p>
      <p className="page-subtitle">Select an available slot from the calendar below.</p>

      {/* SMB loader */}
      {!config && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p className="section-label">Load Business</p>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              className="form-input"
              placeholder="Enter SMB ID…"
              value={inputSmbId}
              onChange={(e) => setInputSmbId(e.target.value)}
            />
            <button className="btn btn-secondary" style={{ whiteSpace: "nowrap" }} onClick={() => setSmbId(inputSmbId)}>
              Load
            </button>
          </div>
        </div>
      )}

      {success && <div className="alert alert-success">✓ Appointment confirmed! Check your email for details.</div>}
      {error    && <div className="alert alert-error">⚠ {error}</div>}

      {config && (
        <>
          {/* Toolbar */}
          <div className="cal-toolbar">
            <div className="cal-toolbar-left">
              <button className="btn btn-secondary" onClick={prevWeek}>← Prev</button>
              <button className="btn btn-secondary" onClick={() => { setWeekStart(dayjs().tz(tz).startOf("week")); }}>
                Today
              </button>
              <button className="btn btn-secondary" onClick={nextWeek}>Next →</button>
              <span className="cal-week-label">
                {weekStart.format("MMM D")} – {weekStart.add(6, "day").format("MMM D, YYYY")}
              </span>
            </div>

            <div className="cal-toolbar-right">
              <span className="badge badge-info">
                🌐 {tz}
              </span>
              {loading && <span className="spinner" />}
            </div>
          </div>

          <CalendarGrid
            slots={slots}
            tz={tz}
            weekStart={weekStart}
            duration={config.duration}
            onSelect={setSelectedSlot}
          />

          {/* Legend */}
          <div className="cal-legend">
            <span className="legend-item">
              <span className="legend-dot available" /> Available slot
            </span>
            <span className="legend-item">
              <span className="legend-dot empty" /> Unavailable / booked
            </span>
          </div>
        </>
      )}

      {selectedSlot && config && (
        <BookingModal
          slot={selectedSlot}
          tz={tz}
          smbId={smbId}
          onClose={() => setSelectedSlot(null)}
          onSuccess={handleSuccess}
        />
      )}

      <style>{`
        .cal-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .cal-toolbar-left { display: flex; align-items: center; gap: 8px; }
        .cal-toolbar-right { display: flex; align-items: center; gap: 10px; }
        .cal-week-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text);
          margin-left: 4px;
        }
        .cal-legend {
          display: flex;
          gap: 20px;
          margin-top: 14px;
          padding: 0 4px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          color: var(--color-text-sub);
        }
        .legend-dot {
          width: 10px; height: 10px;
          border-radius: 3px;
          flex-shrink: 0;
        }
        .legend-dot.available { background: var(--color-accent); }
        .legend-dot.empty { background: var(--color-border); }
      `}</style>
    </div>
  );
}