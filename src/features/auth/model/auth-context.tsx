"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { getSupabase } from "@/shared/api/supabase/client";
import { Profile, UserRole } from "@/shared/api/supabase/types";
import { fetchProfile } from "@/entities/user";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    pass: string,
    meta: {
      role: UserRole;
      residence?: string;
      roomNumber?: string;
      phone?: string;
      fullName?: string;
      studentNumber?: string;
      vendorResidence?: string;
      vendorCategory?: string;
      vendorCompany?: string;
    }
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadProfile = async (userId: string) => {
    try {
      const p = await fetchProfile(userId);
      setProfile(p);
    } catch (e) {
      console.error("Error fetching user profile:", e);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await loadProfile(user.id);
    }
  };

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }

    // Initial session
    sb.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser?.id) {
        loadProfile(currentUser.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Auth state listener
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser?.id) {
        await loadProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, pass: string) => {
    const sb = getSupabase();
    if (!sb) return { error: "Supabase client not configured" };

    const { error } = await sb.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: pass,
    });

    if (error) return { error: error.message };
    return {};
  };

  const signUp = async (
    email: string,
    pass: string,
    meta: {
      role: UserRole;
      residence?: string;
      roomNumber?: string;
      phone?: string;
      fullName?: string;
      studentNumber?: string;
      vendorResidence?: string;
      vendorCategory?: string;
      vendorCompany?: string;
    }
  ) => {
    const sb = getSupabase();
    if (!sb) return { error: "Supabase client not configured" };

    const cleanEmail = email.trim().toLowerCase();

    // Check vendor approved whitelist if vendor
    if (meta.role === "vendor") {
      const { data: approved } = await sb
        .from("approved_partner_emails")
        .select("email")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (!approved) {
        return {
          error:
            "This email is not on the approved external partner list. Please contact SMU facilities to be registered.",
        };
      }
    }

    const { data, error } = await sb.auth.signUp({
      email: cleanEmail,
      password: pass,
    });

    if (error) return { error: error.message };
    if (!data.user) return { error: "Could not create user account" };

    // Insert profile row
    const { error: profErr } = await sb.from("profiles").insert({
      id: data.user.id,
      email: cleanEmail,
      role: meta.role,
      residence: meta.residence || null,
      room_number: meta.roomNumber || null,
      phone: meta.phone || null,
      full_name: meta.fullName || null,
      student_number: meta.studentNumber || null,
      vendor_residence: meta.vendorResidence || null,
      vendor_category: meta.vendorCategory || null,
      vendor_company: meta.vendorCompany || null,
    });

    if (profErr) {
      console.warn("Profile creation note:", profErr.message);
    }

    await loadProfile(data.user.id);
    return {};
  };

  const signOut = async () => {
    const sb = getSupabase();
    if (sb) {
      await sb.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
