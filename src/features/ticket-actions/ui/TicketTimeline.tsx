"use client";

import React from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  MessageSquare,
  RotateCcw,
  Send,
  Flag,
} from "lucide-react";
import { TicketEvent } from "@/shared/api/supabase/types";
import { fmtTime } from "@/shared/lib/format";
import { ROLE_LABELS } from "@/entities/user";

export const TicketTimeline: React.FC<{ events: TicketEvent[] }> = ({
  events,
}) => {
  if (!events || events.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-ink/50">
        No event history recorded yet.
      </div>
    );
  }

  const getIcon = (action: TicketEvent["action"]) => {
    switch (action) {
      case "created":
        return <Flag className="w-4 h-4 text-teal" />;
      case "escalated":
      case "auto_escalated":
        return <ArrowUpRight className="w-4 h-4 text-coral" />;
      case "resolved":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "reopened":
        return <RotateCcw className="w-4 h-4 text-gold" />;
      case "forwarded_vendor":
        return <Send className="w-4 h-4 text-blue-600" />;
      case "commented":
        return <MessageSquare className="w-4 h-4 text-ink/70" />;
      default:
        return <AlertCircle className="w-4 h-4 text-ink/50" />;
    }
  };

  return (
    <div className="space-y-4 pl-2 border-l-2 border-line/60 ml-3">
      {events.map((evt) => (
        <div key={evt.id} className="relative pl-6">
          {/* Timeline Dot */}
          <div className="absolute -left-[31px] top-0.5 w-7 h-7 rounded-full bg-white border border-line flex items-center justify-center shadow-xs">
            {getIcon(evt.action)}
          </div>

          <div className="bg-white/80 border border-line/80 rounded-xl p-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-ink/60 mb-1">
              <span className="font-semibold text-ink">
                {evt.actor_email || "System"}
                {evt.actor_role && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded bg-sand/60 text-[10px] text-teal-dark font-normal">
                    {ROLE_LABELS[evt.actor_role as keyof typeof ROLE_LABELS] ||
                      evt.actor_role}
                  </span>
                )}
              </span>
              <span className="text-[11px] font-mono">{fmtTime(evt.created_at)}</span>
            </div>
            {evt.note && <p className="text-sm text-ink/90 mt-1">{evt.note}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};
