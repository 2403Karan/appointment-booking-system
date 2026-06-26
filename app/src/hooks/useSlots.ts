import { useState, useCallback } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getSlots } from "../api";
import type { Slot } from "../types";

dayjs.extend(utc);
dayjs.extend(timezone);

export function useSlots(smbId: string, tz: string) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = useCallback(
    async (weekStart: dayjs.Dayjs) => {
      if (!smbId) return;
      setLoading(true);
      setError(null);
      try {
        // Fetch a full week
        const minStart = weekStart.utc().startOf("day").toISOString();
        const maxEnd = weekStart.add(6, "day").utc().endOf("day").toISOString();
        const data = await getSlots(smbId, minStart, maxEnd);
        setSlots(data);
      } catch (e: any) {
        setError(e?.response?.data?.detail || "Failed to load slots");
      } finally {
        setLoading(false);
      }
    },
    [smbId, tz]
  );

  return { slots, loading, error, fetchSlots };
}