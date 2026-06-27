import { useState, useCallback } from "react";
import { getSlots } from "../api";
import type { Slot } from "../types";

export function useSlots(smbId: string) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = useCallback(
    async () => {
      if (!smbId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getSlots(smbId);
        setSlots(data);
      } catch (e: any) {
        setError(e?.response?.data?.detail || "Failed to load slots");
      } finally {
        setLoading(false);
      }
    },
    [smbId]
  );

  return { slots, loading, error, fetchSlots };
}
