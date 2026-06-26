import axios from "axios";
import type { SMBConfig, Slot, Appointment, BookingPayload } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// ── SMB Config ──────────────────────────────────────────
export const getConfig = async (smbId: string): Promise<SMBConfig> => {
  const { data } = await api.get(`/api/booking/config/${smbId}`);
  return data;
};

export const createConfig = async (payload: Omit<SMBConfig, "smb_id">): Promise<SMBConfig> => {
  const { data } = await api.post("/api/booking/config", payload);
  return data;
};

export const updateConfig = async (smbId: string, payload: Partial<SMBConfig>): Promise<SMBConfig> => {
  const { data } = await api.put(`/api/booking/config/${smbId}`, payload);
  return data;
};

// ── Slots ────────────────────────────────────────────────
export const getSlots = async (
  smbId: string,
  minStart: string,   // ISO UTC
  maxEnd: string      // ISO UTC
): Promise<Slot[]> => {
  const { data } = await api.get("/api/booking/slots", {
    params: { smb_id: smbId, min_start_time: minStart, max_end_time: maxEnd },
  });
  return data;
};

// ── Appointments ─────────────────────────────────────────
export const createAppointment = async (payload: BookingPayload): Promise<Appointment> => {
  const { data } = await api.post("/api/booking/appointments", payload);
  return data;
};

export const cancelAppointment = async (id: string): Promise<Appointment> => {
  const { data } = await api.patch(`/api/booking/appointments/${id}/cancel`);
  return data;
};

export const getAppointments = async (smbId: string): Promise<Appointment[]> => {
  const { data } = await api.get(`/api/booking/appointments`, {
    params: { smb_id: smbId },
  });
  return data;
};