import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { Slot } from "../../types";

dayjs.extend(utc);
dayjs.extend(timezone);

interface Props {
  slots: Slot[];
  tz: string;
  weekStart: dayjs.Dayjs;
  duration: number;
  onSelect: (slot: Slot) => void;
}

const HOUR_START = 7;
const HOUR_END = 21;

export default function CalendarGrid({ slots, tz, weekStart, duration, onSelect }: Props) {
  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
  const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day"));

  // Build a quick lookup: "YYYY-MM-DD HH:mm" -> slot
  const slotMap = new Map<string, Slot>();
  slots.forEach((s) => {
    const key = dayjs.utc(s.start).tz(tz).format("YYYY-MM-DD HH:mm");
    slotMap.set(key, s);
  });

  const cellHeight = 56; // px per hour
  const minuteH = cellHeight / 60;

  return (
    <div className="cal-wrap">
      {/* Day headers */}
      <div className="cal-header">
        <div className="cal-time-gutter" />
        {days.map((d) => {
          const isToday = d.isSame(dayjs().tz(tz), "day");
          return (
            <div key={d.toString()} className={`cal-day-header ${isToday ? "today" : ""}`}>
              <span className="cal-weekday">{d.format("ddd")}</span>
              <span className={`cal-date ${isToday ? "today-dot" : ""}`}>{d.format("D")}</span>
            </div>
          );
        })}
      </div>

      {/* Grid body */}
      <div className="cal-body">
        {/* Time gutter */}
        <div className="cal-time-gutter">
          {hours.map((h) => (
            <div key={h} className="cal-hour-label" style={{ height: cellHeight }}>
              {dayjs().hour(h).minute(0).format("h A")}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((d) => (
          <div key={d.toString()} className="cal-col">
            {/* Hour cells */}
            {hours.map((h) => (
              <div key={h} className="cal-cell" style={{ height: cellHeight }} />
            ))}

            {/* Available slot chips */}
            {slots
              .filter((s) => {
                const local = dayjs.utc(s.start).tz(tz);
                return local.isSame(d, "day");
              })
              .map((s) => {
                const local = dayjs.utc(s.start).tz(tz);
                const hour = local.hour();
                const minute = local.minute();
                const top = (hour - HOUR_START) * cellHeight + minute * minuteH;
                const height = Math.max(duration * minuteH - 2, 20);

                if (hour < HOUR_START || hour >= HOUR_END) return null;

                return (
                  <button
                    key={s.start}
                    className="cal-slot"
                    style={{ top, height }}
                    onClick={() => onSelect(s)}
                    title={`${local.format("h:mm A")} – ${dayjs.utc(s.end).tz(tz).format("h:mm A")}`}
                  >
                    <span className="cal-slot-time">{local.format("h:mm A")}</span>
                  </button>
                );
              })}
          </div>
        ))}
      </div>

      <style>{`
        .cal-wrap {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        .cal-header {
          display: flex;
          border-bottom: 1px solid var(--color-border);
          background: var(--color-surface-2);
        }
        .cal-time-gutter {
          width: 64px;
          flex-shrink: 0;
          border-right: 1px solid var(--color-border);
        }
        .cal-day-header {
          flex: 1;
          padding: 10px 6px;
          text-align: center;
          border-right: 1px solid var(--color-border-soft);
        }
        .cal-day-header:last-child { border-right: none; }
        .cal-day-header.today .cal-weekday { color: var(--color-accent); }
        .cal-weekday {
          display: block;
          font-size: 11px;
          font-weight: 600;
          font-family: var(--font-mono);
          color: var(--color-text-sub);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .cal-date {
          display: block;
          font-size: 18px;
          font-weight: 700;
          color: var(--color-text);
          margin-top: 2px;
        }
        .today-dot {
          color: var(--color-accent) !important;
        }
        .cal-body {
          display: flex;
          overflow-y: auto;
          max-height: 520px;
        }
        .cal-time-gutter {
          width: 64px;
          flex-shrink: 0;
          border-right: 1px solid var(--color-border);
        }
        .cal-hour-label {
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          padding: 4px 10px 0 0;
          font-size: 10px;
          font-family: var(--font-mono);
          color: var(--color-text-dim);
        }
        .cal-col {
          flex: 1;
          position: relative;
          border-right: 1px solid var(--color-border-soft);
        }
        .cal-col:last-child { border-right: none; }
        .cal-cell {
          border-bottom: 1px solid var(--color-border-soft);
        }
        .cal-slot {
          position: absolute;
          left: 3px;
          right: 3px;
          background: var(--color-accent-dim);
          border: 1px solid rgba(79,124,255,0.4);
          border-radius: var(--radius-sm);
          cursor: pointer;
          padding: 3px 5px;
          overflow: hidden;
          transition: all 0.15s;
          display: flex;
          align-items: flex-start;
        }
        .cal-slot:hover {
          background: var(--color-accent);
          border-color: var(--color-accent);
          z-index: 10;
          box-shadow: 0 2px 12px var(--color-accent-glow);
        }
        .cal-slot:hover .cal-slot-time { color: #fff; }
        .cal-slot-time {
          font-size: 10px;
          font-family: var(--font-mono);
          font-weight: 500;
          color: var(--color-accent);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}