"use client";

import React from "react";
import { AdminUserPanel } from "@/features/admin-roles";

export const AdminPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          SMU Leadership Administration Console
        </h1>
        <p className="text-sm text-ink/70 mt-1">
          Manage campus role privileges, residence assignments, and external contractor verification.
        </p>
      </div>
      <AdminUserPanel />
    </div>
  );
};
