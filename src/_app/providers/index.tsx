"use client";

import React from "react";
import { ToastProvider } from "@/shared/ui";
import { AuthProvider } from "@/features/auth";

export const Providers: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
};
