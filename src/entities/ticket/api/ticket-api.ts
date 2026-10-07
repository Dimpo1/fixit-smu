import { getSupabase } from "@/shared/api/supabase/client";
import {
  Ticket,
  TicketEvent,
  Profile,
  IssueType,
  UrgencyLevel,
} from "@/shared/api/supabase/types";
import { compressImage } from "@/shared/lib/image-compression";
import { CHAINS } from "../model/constants";

export interface CreateTicketPayload {
  issue_type: IssueType;
  category: string;
  custom_category?: string;
  title: string;
  description: string;
  location?: string;
  residence?: string;
  room_number?: string;
  urgency: UrgencyLevel;
  photos?: File[];
}

export async function fetchTickets(): Promise<Ticket[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchTickets error:", error);
    return [];
  }
  return (data || []) as Ticket[];
}

export async function fetchTicketById(id: string): Promise<Ticket | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from("tickets")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("fetchTicketById error:", error);
    return null;
  }
  return data as Ticket;
}

export async function fetchTicketEvents(ticketId: string): Promise<TicketEvent[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from("ticket_events")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("fetchTicketEvents error:", error);
    return [];
  }
  return (data || []) as TicketEvent[];
}

export async function createTicket(
  user: Profile,
  data: CreateTicketPayload
): Promise<{ success: boolean; ticket?: Ticket; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { success: false, error: "Database not configured" };

  const nowIso = new Date().toISOString();
  const insertPayload = {
    created_by: user.id,
    creator_email: user.email,
    creator_name: user.full_name || user.email,
    issue_type: data.issue_type,
    category: data.category,
    custom_category: data.custom_category || null,
    title: data.title,
    description: data.description,
    location: data.location || null,
    residence: data.residence || null,
    room_number: data.room_number || null,
    urgency: data.urgency,
    status: "open",
    stage_index: 0,
    sla_clock_start: nowIso,
    created_at: nowIso,
  };

  const { data: ticket, error } = await sb
    .from("tickets")
    .insert(insertPayload)
    .select()
    .single();

  if (error || !ticket) {
    return { success: false, error: error?.message || "Failed to create ticket" };
  }

  // Create initial event
  await sb.from("ticket_events").insert({
    ticket_id: ticket.id,
    actor_id: user.id,
    actor_email: user.email,
    actor_role: user.role,
    action: "created",
    note: "Report submitted",
    created_at: nowIso,
  });

  // Upload photos if present
  if (data.photos && data.photos.length > 0) {
    try {
      const paths = await uploadTicketPhotos(ticket.id, data.photos);
      if (paths.length > 0) {
        await sb
          .from("tickets")
          .update({ photo_urls: paths })
          .eq("id", ticket.id);
        ticket.photo_urls = paths;
      }
    } catch (photoErr) {
      console.warn("Photo upload warning:", photoErr);
    }
  }

  return { success: true, ticket: ticket as Ticket };
}

export async function uploadTicketPhotos(
  ticketId: string,
  files: File[]
): Promise<string[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const paths: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const blob = await compressImage(file);
      const filename = `${ticketId}/${Date.now()}_${i}.jpg`;
      const { error } = await sb.storage
        .from("ticket-photos")
        .upload(filename, blob, { contentType: "image/jpeg" });

      if (!error) {
        paths.push(filename);
      }
    } catch (err) {
      console.error("Error uploading photo:", err);
    }
  }
  return paths;
}

export async function getTicketPhotoSignedUrls(
  paths: string[]
): Promise<string[]> {
  const sb = getSupabase();
  if (!sb || !paths.length) return [];

  const promises = paths.map((p) =>
    sb.storage.from("ticket-photos").createSignedUrl(p, 3600)
  );

  const results = await Promise.all(promises);
  return results
    .map((r) => (r.data ? r.data.signedUrl : null))
    .filter(Boolean) as string[];
}

export async function escalateTicket(
  ticket: Ticket,
  actor: Profile,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { success: false, error: "Database not configured" };

  const chain = CHAINS[ticket.issue_type];
  const nextIdx = Math.min((ticket.stage_index ?? 0) + 1, chain.length - 1);
  const nowIso = new Date().toISOString();

  const { error } = await sb
    .from("tickets")
    .update({
      stage_index: nextIdx,
      status: "open",
      sla_clock_start: nowIso,
    })
    .eq("id", ticket.id);

  if (error) return { success: false, error: error.message };

  await sb.from("ticket_events").insert({
    ticket_id: ticket.id,
    actor_id: actor.id,
    actor_email: actor.email,
    actor_role: actor.role,
    action: "escalated",
    note: note || `Escalated to next level`,
    created_at: nowIso,
  });

  return { success: true };
}

export async function resolveTicket(
  ticket: Ticket,
  actor: Profile,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { success: false, error: "Database not configured" };

  const nowIso = new Date().toISOString();
  const { error } = await sb
    .from("tickets")
    .update({
      status: "resolved",
      resolved_at: nowIso,
    })
    .eq("id", ticket.id);

  if (error) return { success: false, error: error.message };

  await sb.from("ticket_events").insert({
    ticket_id: ticket.id,
    actor_id: actor.id,
    actor_email: actor.email,
    actor_role: actor.role,
    action: "resolved",
    note: note || "Marked as resolved",
    created_at: nowIso,
  });

  return { success: true };
}

export async function reopenTicket(
  ticket: Ticket,
  actor: Profile,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { success: false, error: "Database not configured" };

  const nowIso = new Date().toISOString();
  const { error } = await sb
    .from("tickets")
    .update({
      status: "open",
      sla_clock_start: nowIso,
      resolved_at: null,
    })
    .eq("id", ticket.id);

  if (error) return { success: false, error: error.message };

  await sb.from("ticket_events").insert({
    ticket_id: ticket.id,
    actor_id: actor.id,
    actor_email: actor.email,
    actor_role: actor.role,
    action: "reopened",
    note: note || "Ticket reopened",
    created_at: nowIso,
  });

  return { success: true };
}

export async function addTicketComment(
  ticket: Ticket,
  actor: Profile,
  note: string,
  isHandlerAction: boolean = false
): Promise<{ success: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { success: false, error: "Database not configured" };

  const nowIso = new Date().toISOString();
  if (isHandlerAction) {
    await sb
      .from("tickets")
      .update({ sla_clock_start: nowIso })
      .eq("id", ticket.id);
  }

  const { error } = await sb.from("ticket_events").insert({
    ticket_id: ticket.id,
    actor_id: actor.id,
    actor_email: actor.email,
    actor_role: actor.role,
    action: "commented",
    note,
    created_at: nowIso,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function forwardTicketToVendor(
  ticket: Ticket,
  actor: Profile,
  vendorProfile: Profile,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { success: false, error: "Database not configured" };

  const nowIso = new Date().toISOString();
  const { error } = await sb
    .from("tickets")
    .update({ vendor_forwarded_at: nowIso })
    .eq("id", ticket.id);

  if (error) return { success: false, error: error.message };

  await sb.from("ticket_events").insert({
    ticket_id: ticket.id,
    actor_id: actor.id,
    actor_email: actor.email,
    actor_role: actor.role,
    action: "forwarded_vendor",
    note: `Forwarded to ${vendorProfile.vendor_company || vendorProfile.full_name || vendorProfile.email}. ${note || ""}`,
    created_at: nowIso,
  });

  return { success: true };
}
