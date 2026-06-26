import { useState, useEffect } from "react";
import { getConfig, createConfig, updateConfig } from "../api";
import type { SMBConfig } from "../types";

const DEFAULT_SMB_ID = import.meta.env.VITE_SMB_ID || "";

export function useConfig() {
  const [config, setConfig] = useState<SMBConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [smbId, setSmbId] = useState(DEFAULT_SMB_ID);

  const load = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getConfig(id);
      setConfig(data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to load config");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (smbId) load(smbId);
  }, [smbId]);

  const save = async (payload: Omit<SMBConfig, "smb_id">) => {
    setLoading(true);
    setError(null);
    try {
      let data: SMBConfig;
      if (config?.smb_id) {
        data = await updateConfig(config.smb_id, payload);
      } else {
        data = await createConfig(payload);
      }
      setConfig(data);
      setSmbId(data.smb_id);
      return data;
    } catch (e: any) {
      const msg = e?.response?.data?.detail || "Failed to save config";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { config, loading, error, smbId, setSmbId, save, reload: () => load(smbId) };
}