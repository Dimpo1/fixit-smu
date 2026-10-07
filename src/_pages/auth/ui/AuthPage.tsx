"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, AuthForm } from "@/features/auth";

export const AuthPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className="py-8 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-coral flex items-center justify-center font-serif font-bold text-2xl text-white mx-auto mb-3 shadow-sm">
          F
        </div>
        <h1 className="font-serif text-2xl font-bold text-ink">
          Fixit SMU Account
        </h1>
        <p className="text-xs text-ink/70 mt-1">
          Sign in or create your student, leadership, or vendor account.
        </p>
      </div>

      <AuthForm onSuccess={() => router.push("/")} />
    </div>
  );
};
