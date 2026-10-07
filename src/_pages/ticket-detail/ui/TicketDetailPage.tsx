"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  User,
  HeartPulse,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import {
  fetchTicketById,
  fetchTicketEvents,
  getTicketPhotoSignedUrls,
  isSlaBreached,
  getSlaRemainingText,
} from "@/entities/ticket";
import { fetchHealthInfo, fetchEmergencyContacts } from "@/entities/health";
import { Ticket, TicketEvent, HealthInfo, EmergencyContact } from "@/shared/api/supabase/types";
import {
  TicketStageLadder,
  TicketTimeline,
  TicketActionBar,
} from "@/features/ticket-actions";
import { Card, Badge, Modal, Button } from "@/shared/ui";
import { shortId, fmtTime } from "@/shared/lib/format";

export const TicketDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  const { profile } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Health Modal for Emergency
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [patientHealth, setPatientHealth] = useState<HealthInfo | null>(null);
  const [patientContacts, setPatientContacts] = useState<EmergencyContact[]>([]);

  const loadData = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    const [t, evts] = await Promise.all([
      fetchTicketById(ticketId),
      fetchTicketEvents(ticketId),
    ]);
    setTicket(t);
    setEvents(evts);

    if (t?.photo_urls && t.photo_urls.length > 0) {
      const urls = await getTicketPhotoSignedUrls(t.photo_urls);
      setPhotoUrls(urls);
    }
    setLoading(false);
  }, [ticketId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenHealthModal = async () => {
    if (!ticket) return;
    setHealthModalOpen(true);
    const [h, c] = await Promise.all([
      fetchHealthInfo(ticket.created_by),
      fetchEmergencyContacts(ticket.created_by),
    ]);
    setPatientHealth(h);
    setPatientContacts(c);
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-ink/60">
        Loading ticket details...
      </div>
    );
  }

  if (!ticket) {
    return (
      <Card className="text-center py-12">
        <h2 className="font-serif text-lg font-bold text-ink">Ticket Not Found</h2>
        <p className="text-xs text-ink/60 mt-1 mb-4">
          The requested report may have been deleted or the ID is invalid.
        </p>
        <Button variant="ghost" onClick={() => router.push("/tickets")}>
          Return to Tickets
        </Button>
      </Card>
    );
  }

  const breached = isSlaBreached(ticket);
  const slaText = getSlaRemainingText(ticket);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href="/tickets"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/60 hover:text-teal transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tickets
      </Link>

      {/* Main Ticket Card */}
      <Card className={breached ? "border-danger/60 bg-red-50/10" : ""}>
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-line">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-teal-dark bg-sand/80 px-2.5 py-1 rounded-md">
              {shortId(ticket.id)}
            </span>
            <Badge variant={ticket.urgency}>
              {ticket.urgency.replace("_", " ")}
            </Badge>
            <Badge variant={ticket.status === "resolved" ? "resolved" : "open"}>
              {ticket.status.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            {breached && (
              <span className="text-danger font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {slaText}
              </span>
            )}
            {!breached && ticket.status === "open" && (
              <span className="text-ink/70 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {slaText}
              </span>
            )}
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="pt-4 space-y-3">
          <h1 className="font-serif text-2xl font-bold text-ink">
            {ticket.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink/70">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-coral" />
              <span>
                {ticket.residence ? `${ticket.residence} ${ticket.room_number ? `(Room ${ticket.room_number})` : ""}` : ticket.location || "Campus Facility"}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal" />
              <span>Created {fmtTime(ticket.created_at)}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-ink/50" />
              <span>{ticket.creator_name || ticket.creator_email || "Anonymous Student"}</span>
            </div>
          </div>

          <p className="text-sm text-ink/90 whitespace-pre-line pt-2">
            {ticket.description}
          </p>

          {/* Photo Gallery */}
          {photoUrls.length > 0 && (
            <div className="pt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-teal-dark/70 mb-2">
                Attached Evidence Photos
              </div>
              <div className="flex flex-wrap gap-3">
                {photoUrls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-24 h-24 rounded-xl overflow-hidden border border-line hover:border-teal block shadow-xs transition-colors"
                  >
                    <img
                      src={url}
                      alt={`evidence-${i}`}
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stage Ladder */}
        <div className="pt-6 mt-6 border-t border-line">
          <div className="text-xs font-semibold uppercase tracking-wider text-teal-dark/70 mb-1">
            Escalation Stage Ladder
          </div>
          <TicketStageLadder ticket={ticket} />
        </div>

        {/* Action Bar */}
        <TicketActionBar
          ticket={ticket}
          currentUser={profile}
          onRefresh={loadData}
          onOpenHealthModal={handleOpenHealthModal}
        />
      </Card>

      {/* Events Timeline Card */}
      <Card>
        <h2 className="font-serif text-lg font-bold text-ink mb-4 pb-2 border-b border-line">
          Activity & Incident Timeline
        </h2>
        <TicketTimeline events={events} />
      </Card>

      {/* Medical Info Modal */}
      <Modal
        isOpen={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
        title="🚨 Confidential Emergency Medical Sheet"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-danger text-xs flex items-center gap-2">
            <HeartPulse className="w-4 h-4 shrink-0" />
            <span>Authorized view for Campus Health Clinic and First Responders only.</span>
          </div>

          {patientHealth ? (
            <div className="grid grid-cols-2 gap-3 text-xs bg-sand/30 p-4 rounded-xl border border-line">
              <div>
                <span className="text-ink/60 block">Blood Type:</span>
                <span className="font-bold text-ink text-sm">{patientHealth.blood_type || "Unknown"}</span>
              </div>
              <div>
                <span className="text-ink/60 block">Medical Aid:</span>
                <span className="font-bold text-ink">{patientHealth.medical_aid_name || "None"} ({patientHealth.medical_aid_number || "—"})</span>
              </div>
              <div className="col-span-2">
                <span className="text-ink/60 block">Allergies:</span>
                <span className="font-medium text-ink">{patientHealth.allergies || "None declared"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-ink/60 block">Chronic Conditions:</span>
                <span className="font-medium text-ink">{patientHealth.chronic_conditions || "None declared"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-ink/60 block">Special Instructions:</span>
                <span className="font-medium text-ink">{patientHealth.special_instructions || "None"}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-sand/20 rounded-xl text-center text-xs text-ink/60">
              No medical passport recorded by this student.
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-2">
              Next-of-Kin Emergency Contacts:
            </h4>
            <div className="space-y-2">
              {patientContacts.map((c, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-white border border-line text-xs">
                  <div>
                    <span className="font-bold text-ink">{c.name}</span>
                    <span className="text-ink/60 ml-2">({c.relationship})</span>
                  </div>
                  <a href={`tel:${c.phone}`} className="font-mono font-bold text-teal hover:underline">
                    📞 {c.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
