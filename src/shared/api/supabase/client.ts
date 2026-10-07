import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/shared/config/env";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") {
    // Server-side
    if (!env.supabaseUrl || !env.supabaseAnonKey) return null;
    return createClient(env.supabaseUrl, env.supabaseAnonKey);
  }

  // Client-side singleton
  if (!supabaseInstance) {
    if (env.supabaseUrl && env.supabaseAnonKey) {
      supabaseInstance = createClient(env.supabaseUrl, env.supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }
  }
  return supabaseInstance;
}
