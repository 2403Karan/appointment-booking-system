import { useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { createAppointment } from "../../api";
import type { Appointment, Slot } from "../../types";

dayjs.extend(utc);
dayjs.extend(timezone);

interface Props {
  slot: Slot;
  tz: string;
  smbId: string;
  onClose: () => void;
  onSuccess: (appointment: Appointment) => void;
}

export default function BookingModal({ slot, tz, smbId, onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startLocal = dayjs.utc(slot.start).tz(tz);
  const endLocal   = dayjs.utc(slot.end).tz(tz);

  const handleBook = async () => {
    if (!name.trim()) { setError("Please enter your name."); return; }
    setLoading(true);
    setError(null);
    try {
      const appointment = await createAppointment({
        smb_id: smbId,
        slot_start: slot.start,
        slot_end: slot.end,
        lead_name: name.trim(),
      });
      onSuccess(appointment);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Booking failed. This slot may no longer be available.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="modal-title">Confirm Appointment</p>
            <p className="modal-subtitle">Fill in your details to reserve this slot.</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Slot summary */}
          <div className="slot-summary">
            <div className="slot-row">
              <span className="slot-icon">📅</span>
              <span>{startLocal.format("dddd, MMMM D, YYYY")}</span>
            </div>
            <div className="slot-row">
              <span className="slot-icon">🕐</span>
              <span>
                {startLocal.format("h:mm A")} – {endLocal.format("h:mm A")}
                <span className="slot-tz"> ({tz})</span>
              </span>
            </div>
          </div>

          <hr className="divider" />

          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Your Name</label>
            <input
              className="form-input"
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleBook()}
              autoFocus
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleBook} disabled={loading || !name.trim()}>
            {loading ? <span className="spinner" /> : "Confirm Booking"}
          </button>
        </div>
      </div>

      <style>{`
        .slot-summary {
          background: var(--color-surface-2);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 18px;
        }
        .slot-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: var(--color-text);
        }
        .slot-icon { font-size: 15px; }
        .slot-tz {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--color-muted);
          margin-left: 4px;
        }
      `}</style>
    </div>
  );
}
