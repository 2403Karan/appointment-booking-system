import axios from "axios";
import type { Appointment, BookingPayload, Slot } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

interface SlotResponse {
  slot_start: string;
  slot_end: string;
}

export const getSlots = async (smbId: string): Promise<Slot[]> => {
  const { data } = await api.get("/api/booking/slots", {
    params: { smb_id: smbId },
  });
  console.log("Fetched slots:", data);
  return (data as SlotResponse[]).map((slot) => ({
    start: slot.slot_start,
    end: slot.slot_end,
  }));
};

export const createAppointment = async (payload: BookingPayload): Promise<Appointment> => {
  const { data } = await api.post("api/booking/appointments", payload);
  return data;
};

export const cancelAppointment = async (id: string): Promise<Appointment> => {
  const { data } = await api.patch(`api/booking/appointments/${id}/cancel`);
  return data;
};

export const getBusinessConfig = async (smbId: string): Promise<any> => {
  const { data } = await api.get("/api/booking/business-config", {
    params: { smb_id: smbId },
  });
  return data;
}