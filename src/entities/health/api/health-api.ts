import { getSupabase } from "@/shared/api/supabase/client";
import { HealthInfo, EmergencyContact } from "@/shared/api/supabase/types";

export async function fetchHealthInfo(
  userId: string
): Promise<HealthInfo | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from("health_info")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("fetchHealthInfo error:", error);
    return null;
  }
  return data as HealthInfo;
}

export async function fetchEmergencyContacts(
  userId: string
): Promise<EmergencyContact[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from("emergency_contacts")
    .select("*")
    .eq("user_id", userId)
    .order("id");

  if (error) {
    console.error("fetchEmergencyContacts error:", error);
    return [];
  }
  return (data || []) as EmergencyContact[];
}

export async function saveHealthAndContacts(
  userId: string,
  healthData: Partial<HealthInfo>,
  contacts: Omit<EmergencyContact, "id" | "user_id">[]
): Promise<{ success: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { success: false, error: "Database not configured" };

  const { error: hErr } = await sb.from("health_info").upsert({
    user_id: userId,
    blood_type: healthData.blood_type || null,
    allergies: healthData.allergies || null,
    chronic_conditions: healthData.chronic_conditions || null,
    medical_aid_name: healthData.medical_aid_name || null,
    medical_aid_number: healthData.medical_aid_number || null,
    special_instructions: healthData.special_instructions || null,
    updated_at: new Date().toISOString(),
  });

  if (hErr) return { success: false, error: hErr.message };

  await sb.from("emergency_contacts").delete().eq("user_id", userId);

  const validContacts = contacts.filter((c) => c.name && c.phone);
  if (validContacts.length > 0) {
    const { error: cErr } = await sb.from("emergency_contacts").insert(
      validContacts.map((c) => ({
        user_id: userId,
        name: c.name,
        relationship: c.relationship,
        phone: c.phone,
      }))
    );
    if (cErr) return { success: false, error: cErr.message };
  }

  return { success: true };
}
