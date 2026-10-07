"use client";

import React from "react";
import { Check, Clock } from "lucide-react";
import { Ticket } from "@/shared/api/supabase/types";
import { CHAINS, STAGE_LABELS } from "@/entities/ticket";

export const TicketStageLadder: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  const chain = CHAINS[ticket.issue_type] || ["student", "src"];
  const currentIdx = ticket.stage_index ?? 0;
  const isResolved = ticket.status === "resolved";

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-line z-0" />
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-teal z-0 transition-all duration-300"
          style={{
            width: isResolved
              ? "calc(100% - 48px)"
              : `${(currentIdx / Math.max(chain.length - 1, 1)) * 100}%`,
          }}
        />

        {chain.map((role, idx) => {
          const isPassed = isResolved || idx < currentIdx;
          const isCurrent = !isResolved && idx === currentIdx;

          return (
            <div
              key={role}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-sm ${
                  isPassed
                    ? "bg-teal text-white"
                    : isCurrent
                    ? "bg-coral text-white ring-4 ring-coral/20 animate-pulse"
                    : "bg-white border-2 border-line text-ink/40"
                }`}
              >
                {isPassed ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`text-[11px] font-medium mt-2 max-w-[80px] leading-tight ${
                  isCurrent
                    ? "text-coral font-bold"
                    : isPassed
                    ? "text-teal-dark font-semibold"
                    : "text-ink/50"
                }`}
              >
                {STAGE_LABELS[role] || role}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
