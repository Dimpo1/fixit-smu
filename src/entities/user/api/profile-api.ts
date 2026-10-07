import { getSupabase } from "@/shared/api/supabase/client";
import { Profile } from "@/shared/api/supabase/types";

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("fetchProfile error:", error);
    return null;
  }
  return data as Profile;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<{ success: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { success: false, error: "Database not configured" };

  const { error } = await sb
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function fetchLeaders(): Promise<Profile[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .neq("role", "student");

  if (error) {
    console.error("fetchLeaders error:", error);
    return [];
  }
  return (data || []) as Profile[];
}

export async function searchProfiles(query: string): Promise<Profile[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const trimmed = query.trim();
  if (!trimmed) return [];

  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .or(
      `email.ilike.%${trimmed}%,student_number.ilike.%${trimmed}%,full_name.ilike.%${trimmed}%`
    )
    .limit(20);

  if (error) {
    console.error("searchProfiles error:", error);
    return [];
  }
  return (data || []) as Profile[];
}
