export type UserRole =
  | "student"
  | "house_committee"
  | "residence_manager"
  | "src"
  | "vendor";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  residence?: string | null;
  room_number?: string | null;
  phone?: string | null;
  full_name?: string | null;
  student_number?: string | null;
  vendor_residence?: string | null;
  vendor_category?: string | null;
  vendor_company?: string | null;
  notif_seen_at?: string | null;
  created_at?: string | null;
}

export type IssueType = "residence" | "campus";
export type UrgencyLevel = "health_emergency" | "high" | "medium" | "low";
export type TicketStatus = "open" | "resolved" | "closed";

export interface Ticket {
  id: string;
  created_by: string;
  creator_email?: string | null;
  creator_name?: string | null;
  issue_type: IssueType;
  category: string;
  custom_category?: string | null;
  title: string;
  description: string;
  location?: string | null;
  residence?: string | null;
  room_number?: string | null;
  urgency: UrgencyLevel;
  status: TicketStatus;
  stage_index: number;
  sla_clock_start?: string | null;
  photo_urls?: string[] | null;
  vendor_forwarded_at?: string | null;
  resolved_at?: string | null;
  created_at: string;
}

export interface TicketEvent {
  id: string;
  ticket_id: string;
  actor_id: string;
  actor_email?: string | null;
  actor_role?: string | null;
  action:
    | "created"
    | "escalated"
    | "auto_escalated"
    | "resolved"
    | "reopened"
    | "forwarded_vendor"
    | "commented";
  note?: string | null;
  created_at: string;
}

export interface HealthInfo {
  id?: string;
  user_id: string;
  blood_type?: string | null;
  allergies?: string | null;
  chronic_conditions?: string | null;
  medical_aid_name?: string | null;
  medical_aid_number?: string | null;
  special_instructions?: string | null;
  updated_at?: string | null;
}

export interface EmergencyContact {
  id?: string | number;
  user_id: string;
  name: string;
  relationship: string;
  phone: string;
}

export interface AppFeedback {
  id?: string;
  user_id?: string | null;
  rating?: number | null;
  category?: string | null;
  comment: string;
  created_at?: string;
}

export interface ApprovedPartnerEmail {
  id?: string;
  email: string;
  company?: string | null;
  added_at?: string;
}
