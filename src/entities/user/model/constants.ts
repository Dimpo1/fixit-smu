import { UserRole } from "@/shared/api/supabase/types";

export const ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  house_committee: "House Committee Member",
  residence_manager: "Residence Manager",
  src: "SRC Member",
  vendor: "External Vendor",
};

export const RESIDENCES: string[] = [
  "1A Residence",
  "1B Residence",
  "1C Residence",
  "1D Residence",
  "2A Residence",
  "2B Residence",
  "4B Residence",
  "5A Residence",
  "5B Residence",
  "2K-Beds",
  "Nursing Home",
  "Drie Lelies",
  "Arebeng 1",
  "Arebeng 2",
  "Madeira Isles",
  "Other (type below)",
];

export const CAMPUS_LOCATIONS: string[] = [
  "Library",
  "Main Administration Building",
  "Lecture Halls / Auditorium",
  "Student Centre",
  "Cafeteria / Dining Hall",
  "Campus Clinic",
  "Sports & Recreation Centre",
  "Computer / IT Labs",
  "Parking Area",
  "Other (type below)",
];

export const OTHER_VAL = "Other (type below)";

export interface LeaderContact {
  name: string;
  role: UserRole;
  residence: string;
  phone: string;
  isDemo?: boolean;
}

export const DEMO_LEADERS: LeaderContact[] = [
  { name: "Lerato Mokoena", role: "house_committee", residence: "1A Residence", phone: "081 234 5601", isDemo: true },
  { name: "Karabo Dlamini", role: "house_committee", residence: "1B Residence", phone: "081 234 5602", isDemo: true },
  { name: "Naledi Mahlangu", role: "house_committee", residence: "1C Residence", phone: "081 234 5603", isDemo: true },
  { name: "Tumi Radebe", role: "house_committee", residence: "1D Residence", phone: "081 234 5604", isDemo: true },
  { name: "Boitumelo Sithole", role: "house_committee", residence: "2A Residence", phone: "081 234 5605", isDemo: true },
  { name: "Katlego Nkosi", role: "house_committee", residence: "2B Residence", phone: "081 234 5606", isDemo: true },
  { name: "Palesa Mokgadi", role: "house_committee", residence: "4B Residence", phone: "081 234 5607", isDemo: true },
  { name: "Sipho Ndlovu", role: "house_committee", residence: "5A Residence", phone: "081 234 5608", isDemo: true },
  { name: "Refilwe Mabuza", role: "house_committee", residence: "5B Residence", phone: "081 234 5609", isDemo: true },
  { name: "Ayanda Zulu", role: "house_committee", residence: "2K-Beds", phone: "081 234 5610", isDemo: true },
  { name: "Nomvula Khumalo", role: "house_committee", residence: "Nursing Home", phone: "081 234 5611", isDemo: true },
  { name: "Thato Molefe", role: "house_committee", residence: "Drie Lelies", phone: "081 234 5612", isDemo: true },
  { name: "Kagiso Modise", role: "house_committee", residence: "Arebeng 1", phone: "081 234 5613", isDemo: true },
  { name: "Lesego Mahlaba", role: "house_committee", residence: "Arebeng 2", phone: "081 234 5614", isDemo: true },
  { name: "Bongani Cele", role: "house_committee", residence: "Madeira Isles", phone: "081 234 5615", isDemo: true },
  { name: "S. Maluleke", role: "residence_manager", residence: "Blocks 1 & 2", phone: "082 345 6701", isDemo: true },
  { name: "P. Ntuli", role: "residence_manager", residence: "Blocks 4 & 5, 2K-Beds, Nursing Home", phone: "082 345 6702", isDemo: true },
  { name: "T. van Wyk", role: "residence_manager", residence: "Off-campus & partnered accommodation", phone: "082 345 6703", isDemo: true },
  { name: "SRC President's Office", role: "src", residence: "", phone: "083 456 7801", isDemo: true },
  { name: "SRC Residence Affairs", role: "src", residence: "", phone: "083 456 7802", isDemo: true },
  { name: "SRC Campus Affairs", role: "src", residence: "", phone: "083 456 7803", isDemo: true },
];
