import { useEffect, useState } from "react";
import type { SMBConfig } from "../types";

const DEFAULT_SMB_ID = import.meta.env.VITE_SMB_ID || "";
const STORAGE_KEY = "lyftr-booking-config";

const defaultConfig: SMBConfig = {
  smb_id: DEFAULT_SMB_ID,
  timezone: "Asia/Kolkata",
  duration: 30,
  start_time: "09:00:00",
  end_time: "18:00:00",
  days: "1,2,3,4,5",
  excluded_days: { days: [] },
};

const readConfig = (): SMBConfig => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultConfig, ...JSON.parse(stored) } : defaultConfig;
  } catch {
    return defaultConfig;
  }
};

export function useConfig() {
  const [config, setConfig] = useState<SMBConfig>(() => readConfig());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [smbId, setSmbId] = useState(() => readConfig().smb_id);

  useEffect(() => {
    const next = { ...config, smb_id: smbId };
    setConfig(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, [smbId]);

  const save = async (payload: Omit<SMBConfig, "smb_id">) => {
    setLoading(true);
    setError(null);
    try {
      const next = { ...payload, smb_id: smbId || crypto.randomUUID() };
      setConfig(next);
      setSmbId(next.smb_id);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    } catch {
      const msg = "Failed to save local configuration.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { config, loading, error, smbId, setSmbId, save, reload: () => setConfig(readConfig()) };
}
