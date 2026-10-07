"use client";

import React from "react";
import { CreateTicketForm } from "@/features/create-ticket";

export const ReportPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="max-w-2xl mx-auto text-center sm:text-left">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          Report an Incident or Maintenance Need
        </h1>
        <p className="text-sm text-ink/70 mt-1">
          Submit details and photos. Your report will be automatically routed according to SMU SLA response protocols.
        </p>
      </div>
      <CreateTicketForm />
    </div>
  );
};
