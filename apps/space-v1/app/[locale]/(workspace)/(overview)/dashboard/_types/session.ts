import type { PaymentStatus } from "@workspace/supabase-data/types/entities";

export type SessionStatus = "scheduled" | "open" | "completed" | "cancelled" | "no_show";
export type PaymentStatusType = PaymentStatus;
export type SessionType = "online" | "presencial" | "hybrid";

export interface NextSession {
  id: string;
  patientName: string;
  patientAvatar?: string;
  startTime: Date;
  durationMinutes: number;
  type: SessionType;
  location?: string;
  onlineUrl?: string;
}

export interface UpcomingSession {
  id: string;
  timeISO: string;
  clientName: string;
  status: SessionStatus;
  sessionType: SessionType;
  location?: string;
  meetingUrl?: string;
  avatarUrl?: string;
  price?: number | null;
  paymentStatus?: PaymentStatusType | null;
  isConfirmed?: boolean;
  reminderSent?: boolean;
}
