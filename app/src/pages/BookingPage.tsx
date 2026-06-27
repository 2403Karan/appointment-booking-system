import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { cancelAppointment } from "../api";
import { useSlots } from "../hooks/useSlots";
import CalendarGrid from "../components/calendar/CalendarGrid";
import BookingModal from "../components/booking/BookingModal";
import type { Appointment, Slot } from "../types";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function BookingPage() {
  const [smbId, setSmbId] = useState(import.meta.env.VITE_SMB_ID || "");
  const [inputSmbId, setInputSmbId] = useState(smbId);
  const [weekStart, setWeekStart] = useState(() => dayjs().startOf("day"));
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);
  const [success, setSuccess] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const { slots, loading, error, fetchSlots } = useSlots(smbId);
  const slotDuration =
    slots.length > 0 ? Math.max(dayjs(slots[0].end).diff(dayjs(slots[0].start), "minute"), 1) : 30;

  useEffect(() => {
    if (smbId) fetchSlots();
  }, [smbId, fetchSlots]);

  const prevWeek = () => setWeekStart((w) => w.subtract(7, "days"));
  const nextWeek = () => setWeekStart((w) => w.add(7, "days"));

  const handleLoadBusiness = () => {
    const nextSmbId = inputSmbId.trim();
    if (!nextSmbId) return;
    setSelectedSlot(null);
    setBookedAppointment(null);
    setSuccess(false);
    setCancelSuccess(false);
    setCancelError(null);
    setSmbId(nextSmbId);
  };

  const handleSuccess = (appointment: Appointment) => {
    setSelectedSlot(null);
    setBookedAppointment(appointment);
    setSuccess(true);
    setCancelSuccess(false);
    setCancelError(null);
    fetchSlots();
    setTimeout(() => setSuccess(false), 4000);
  };

  const handleCancelAppointment = async () => {
    if (!bookedAppointment) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const cancelled = await cancelAppointment(bookedAppointment.id);
      setBookedAppointment(cancelled);
      setCancelSuccess(true);
      fetchSlots();
    } catch (e: any) {
      setCancelError(e?.response?.data?.detail || "Failed to cancel appointment.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      <p className="page-title">Book an Appointment</p>
      <p className="page-subtitle">Select an available slot from the calendar below.</p>

      <div className="card" style={{ marginBottom: 20 }}>
        <p className="section-label">Load Business</p>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            className="form-input"
            placeholder="Enter SMB ID..."
            value={inputSmbId}
            onChange={(e) => setInputSmbId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLoadBusiness()}
          />
          <button className="btn btn-secondary" style={{ whiteSpace: "nowrap" }} onClick={handleLoadBusiness}>
          Show Slots
          </button>
        </div>
      </div>

      {success && <div className="alert alert-success">Appointment confirmed.</div>}
      {cancelSuccess && <div className="alert alert-success">Appointment cancelled.</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {cancelError && <div className="alert alert-error">{cancelError}</div>}

      {bookedAppointment && bookedAppointment.status !== "CANCELLED" && (
        <div className="card cancel-card">
          <div>
            <p className="section-label">Current Appointment</p>
            <p className="appointment-summary">
              {dayjs.utc(bookedAppointment.slot_start).tz(tz).format("MMM D, YYYY h:mm A")} for{" "}
              {bookedAppointment.lead_name}
            </p>
          </div>
          <button className="btn btn-danger" onClick={handleCancelAppointment} disabled={cancelling}>
            {cancelling ? <span className="spinner" /> : "Cancel Appointment"}
          </button>
        </div>
      )}

      {smbId && (
        <>
          <div className="cal-toolbar">
            <div className="cal-toolbar-left">
              <button className="btn btn-secondary" onClick={prevWeek}>Prev</button>
              <button className="btn btn-secondary" onClick={() => setWeekStart(dayjs())}>
                Today
              </button>
              <button className="btn btn-secondary" onClick={nextWeek}>Next</button>
              <span className="cal-week-label">
                {weekStart.format("ddd, DD MMM")} -{" "}
                {weekStart.add(6, "day").format("ddd, DD MMM YYYY")}
              </span>
            </div>

            <div className="cal-toolbar-right">
              <span className="badge badge-info">{tz}</span>
              {loading && <span className="spinner" />}
            </div>
          </div>

          <CalendarGrid
            slots={slots}
            tz={tz}
            weekStart={weekStart}
            duration={slotDuration}
            onSelect={setSelectedSlot}
          />

          <div className="cal-legend">
            <span className="legend-item">
              <span className="legend-dot available" /> Available Slots
            </span>
            <span className="legend-item">
              <span className="legend-dot empty" /> Unavailable / booked Slots
            </span>
          </div>
        </>
      )}

      {selectedSlot && smbId && (
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
        .cal-toolbar-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
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
        .cancel-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 20px;
        }
        .appointment-summary {
          margin-top: 6px;
          color: var(--color-text);
          font-size: 14px;
        }
        @media (max-width: 640px) {
          .cancel-card {
            align-items: stretch;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
