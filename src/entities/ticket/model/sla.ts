import { Ticket, UrgencyLevel } from "@/shared/api/supabase/types";
import { SLA_HOURS } from "./constants";

export function getSlaDeadline(
  clockStartIso?: string | null,
  urgency: UrgencyLevel = "medium"
): Date | null {
  if (!clockStartIso) return null;
  const start = new Date(clockStartIso).getTime();
  if (isNaN(start)) return null;

  const hours = SLA_HOURS[urgency] || 24;
  return new Date(start + hours * 3600 * 1000);
}

export function isSlaBreached(ticket: Ticket): boolean {
  if (ticket.status === "resolved" || ticket.status === "closed") return false;
  const deadline = getSlaDeadline(ticket.sla_clock_start, ticket.urgency);
  if (!deadline) return false;
  return Date.now() > deadline.getTime();
}

export function getSlaRemainingText(ticket: Ticket): string {
  if (ticket.status === "resolved") return "Resolved";
  if (ticket.status === "closed") return "Closed";

  const deadline = getSlaDeadline(ticket.sla_clock_start, ticket.urgency);
  if (!deadline) return "No SLA active";

  const diffMs = deadline.getTime() - Date.now();
  if (diffMs <= 0) {
    const overdueMins = Math.floor(Math.abs(diffMs) / 60000);
    if (overdueMins > 60) {
      const overdueHours = Math.floor(overdueMins / 60);
      return `Breached (${overdueHours}h overdue)`;
    }
    return `Breached (${overdueMins}m overdue)`;
  }

  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m left`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m left`;
}
