import { UrgencyLevel, UserRole } from "@/shared/api/supabase/types";

export const SLA_HOURS: Record<UrgencyLevel, number> = {
  health_emergency: 0.5,
  high: 2,
  medium: 24,
  low: 24,
};

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  health_emergency: "🚨 Health Emergency",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const CATEGORIES: string[] = [
  "Wi-Fi / Internet Connectivity",
  "Maintenance (plumbing, electrical, structural)",
  "Water & Sanitation",
  "Security & Safety",
  "Harassment / Misconduct",
  "Noise / Conduct Dispute",
  "Academic / Administrative",
  "Health & Wellness Facility",
  "Other",
];

export const VENDOR_CATEGORIES: string[] = [
  "Wi-Fi / Internet Connectivity",
  "Maintenance (plumbing, electrical, structural)",
];

export const CHAINS: Record<"residence" | "campus", UserRole[]> = {
  residence: ["student", "house_committee", "residence_manager", "src"],
  campus: ["student", "src"],
};

export const STAGE_LABELS: Record<UserRole, string> = {
  student: "Reported",
  vendor: "External Vendor",
  house_committee: "House Committee",
  residence_manager: "Residence Manager",
  src: "SRC",
};
