"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, PlusCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/features/auth";
import { fetchTickets, isSlaBreached, getSlaRemainingText } from "@/entities/ticket";
import { Ticket, UrgencyLevel, TicketStatus } from "@/shared/api/supabase/types";
import { Card, Button, Input, Badge } from "@/shared/ui";
import { shortId, fmtTime } from "@/shared/lib/format";

export const TicketsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<"all" | "my" | "queue">("all");
  const [search, setSearch] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchTickets().then((data) => {
      setTickets(data);
      setLoading(false);
    });
  }, []);

  const isLeader = profile && profile.role !== "student";

  const filteredTickets = tickets.filter((t) => {
    // Tab filter
    if (tab === "my") {
      if (!user || t.created_by !== user.id) return false;
    } else if (tab === "queue") {
      if (!isLeader) return false;
      // In queue: match residence or role domain
      if (profile?.role === "house_committee" && profile.residence) {
        if (t.residence !== profile.residence) return false;
      }
      if (profile?.role === "vendor" && profile.vendor_category) {
        if (t.category !== profile.vendor_category) return false;
      }
    }

    // Urgency filter
    if (urgencyFilter !== "all" && t.urgency !== urgencyFilter) return false;

    // Status filter
    if (statusFilter !== "all" && t.status !== statusFilter) return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const sId = shortId(t.id).toLowerCase();
      const title = t.title.toLowerCase();
      const desc = (t.description || "").toLowerCase();
      const loc = (t.residence || t.location || "").toLowerCase();
      const cat = t.category.toLowerCase();

      if (
        !sId.includes(q) &&
        !title.includes(q) &&
        !desc.includes(q) &&
        !loc.includes(q) &&
        !cat.includes(q)
      ) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            Campus Incident Tickets
          </h1>
          <p className="text-sm text-ink/70 mt-1">
            Browse, filter, and track SLA response progress across SMU residences.
          </p>
        </div>
        <Link href="/report">
          <Button variant="primary">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Report Issue
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line gap-4 text-sm font-semibold">
        <button
          onClick={() => setTab("all")}
          className={`pb-3 border-b-2 transition-colors ${
            tab === "all"
              ? "border-coral text-coral"
              : "border-transparent text-ink/60 hover:text-ink"
          }`}
        >
          All Reports ({tickets.length})
        </button>

        {user && (
          <button
            onClick={() => setTab("my")}
            className={`pb-3 border-b-2 transition-colors ${
              tab === "my"
                ? "border-coral text-coral"
                : "border-transparent text-ink/60 hover:text-ink"
            }`}
          >
            My Reports ({tickets.filter((t) => t.created_by === user.id).length})
          </button>
        )}

        {isLeader && (
          <button
            onClick={() => setTab("queue")}
            className={`pb-3 border-b-2 transition-colors ${
              tab === "queue"
                ? "border-coral text-coral"
                : "border-transparent text-ink/60 hover:text-ink"
            }`}
          >
            Assigned Queue
          </button>
        )}
      </div>

      {/* Controls & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, title, residence..."
          />
        </div>

        <div>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-line rounded-lg text-sm text-ink"
          >
            <option value="all">All Urgencies</option>
            <option value="health_emergency">🚨 Health Emergency</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-line rounded-lg text-sm text-ink"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open / In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {loading ? (
          <Card className="text-center py-12 text-sm text-ink/60">
            Loading tickets from Supabase...
          </Card>
        ) : filteredTickets.length === 0 ? (
          <Card className="text-center py-12 text-sm text-ink/60">
            No matching incident tickets found.
          </Card>
        ) : (
          filteredTickets.map((t) => {
            const breached = isSlaBreached(t);
            const slaText = getSlaRemainingText(t);

            return (
              <Link key={t.id} href={`/tickets/${t.id}`} className="block">
                <Card
                  className={`p-4 sm:p-5 transition-all hover:border-teal hover:shadow-sm ${
                    breached ? "border-danger/60 bg-red-50/30" : ""
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-teal-dark bg-sand/60 px-2 py-0.5 rounded">
                        {shortId(t.id)}
                      </span>
                      <Badge variant={t.urgency}>
                        {t.urgency.replace("_", " ")}
                      </Badge>
                      <Badge variant={t.status === "resolved" ? "resolved" : "open"}>
                        {t.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="text-xs text-ink/60 flex items-center gap-2">
                      {breached && (
                        <span className="text-danger font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {slaText}
                        </span>
                      )}
                      {!breached && t.status === "open" && (
                        <span className="text-ink/70 font-mono text-[11px]">
                          ⏱ {slaText}
                        </span>
                      )}
                      <span>·</span>
                      <span className="font-mono text-[11px]">{fmtTime(t.created_at)}</span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-base text-ink mb-1 group-hover:text-coral">
                    {t.title}
                  </h3>

                  <p className="text-xs text-ink/70 line-clamp-2 mb-3">
                    {t.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-xs text-ink/60 pt-2 border-t border-line/60">
                    <span className="font-medium text-teal-dark">
                      📍 {t.residence ? `${t.residence} ${t.room_number ? `(${t.room_number})` : ""}` : t.location || "SMU Campus"}
                    </span>
                    <span>Category: {t.category}</span>
                  </div>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};
