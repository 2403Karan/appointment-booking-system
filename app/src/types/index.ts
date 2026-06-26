export interface SMBConfig {
  smb_id: string;
  timezone: string;
  duration: number;
  start_time: string;   // "09:00:00"
  end_time: string;     // "18:00:00"
  days: string;         // "1,2,3,4,5"
  excluded_days: {
    days: { day: string; message: string }[];
  };
}

export interface Slot {
  start: string;  // ISO UTC string
  end: string;
}

export interface Appointment {
  id: string;
  smb_id: string;
  lead_id: string;
  status: "ACTIVE" | "CANCELLED";
  slot_start: string;
  slot_end: string;
  lead_name: string;
}

export interface BookingPayload {
  smb_id: string;
  slot_start: string;
  slot_end: string;
  lead_name: string;
  lead_id?: string;
}