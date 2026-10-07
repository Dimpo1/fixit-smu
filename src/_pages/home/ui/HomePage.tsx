"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  PlusCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Users,
  Building,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { fetchTickets, isSlaBreached } from "@/entities/ticket";
import { Ticket } from "@/shared/api/supabase/types";
import { Card, Button, Badge } from "@/shared/ui";
import { shortId, fmtTime } from "@/shared/lib/format";

export const HomePage: React.FC = () => {
  const { user, profile } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets().then((data) => {
      setTickets(data);
      setLoading(false);
    });
  }, []);

  const openTickets = tickets.filter((t) => t.status === "open");
  const resolvedTickets = tickets.filter((t) => t.status === "resolved");
  const breachedTickets = openTickets.filter((t) => isSlaBreached(t));
  const emergencyTickets = openTickets.filter((t) => t.urgency === "health_emergency");

  return (
    <div className="space-y-8">
      {/* Hero Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            Fixit SMU
          </h1>
          <p className="text-sm text-ink/70 mt-1">
            Sefako Makgatho Health Sciences University · Report It, Track It, Fix It
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link href="/report">
            <Button variant="primary" size="md">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Report Issue
            </Button>
          </Link>
          <Link href="/emergency">
            <Button variant="danger" size="md">
              <AlertTriangle className="w-4 h-4 mr-1.5" />
              Emergency SOS
            </Button>
          </Link>
        </div>
      </div>

      {/* Emergency Active Banner */}
      {emergencyTickets.length > 0 && (
        <div className="p-4 rounded-2xl bg-danger text-white flex items-center justify-between shadow-md animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <div className="font-bold text-sm">
                🚨 {emergencyTickets.length} ACTIVE HEALTH EMERGENCY REPORT
              </div>
              <div className="text-xs text-white/90">
                Clinic and rapid response personnel are currently on alert.
              </div>
            </div>
          </div>
          <Link href={`/tickets/${emergencyTickets[0].id}`}>
            <Button variant="ghost" size="sm" className="bg-white/20 text-white border-white/40 hover:bg-white hover:text-danger">
              View Priority Ticket
            </Button>
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-ink/60 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Open Issues</span>
            <Clock className="w-4 h-4 text-teal" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-ink">
            {loading ? "…" : openTickets.length}
          </div>
          <div className="text-[11px] text-ink/60 mt-1">Active resolution queue</div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-ink/60 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-emerald-700">
            {loading ? "…" : resolvedTickets.length}
          </div>
          <div className="text-[11px] text-ink/60 mt-1">Fixed campus issues</div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-ink/60 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">SLA Breaches</span>
            <AlertTriangle className="w-4 h-4 text-danger" />
          </div>
          <div className={`text-2xl sm:text-3xl font-bold font-serif ${breachedTickets.length > 0 ? "text-danger" : "text-ink"}`}>
            {loading ? "…" : breachedTickets.length}
          </div>
          <div className="text-[11px] text-ink/60 mt-1">Overdue resolution target</div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-ink/60 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">User Status</span>
            <ShieldCheck className="w-4 h-4 text-coral" />
          </div>
          <div className="text-sm font-bold font-serif text-ink truncate mt-1">
            {user ? (profile?.role ? profile.role.toUpperCase() : "STUDENT") : "GUEST"}
          </div>
          <div className="text-[11px] text-ink/60 mt-2 truncate">
            {user ? profile?.email : "Sign in for student features"}
          </div>
        </Card>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-line">
            <h2 className="font-serif font-bold text-base text-ink">Recent Reports</h2>
            <Link href="/tickets" className="text-xs font-semibold text-coral hover:underline">
              View all &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-xs text-ink/60 text-center py-6">Loading tickets...</p>
            ) : tickets.slice(0, 4).length === 0 ? (
              <p className="text-xs text-ink/60 text-center py-6">No incident reports yet.</p>
            ) : (
              tickets.slice(0, 4).map((t) => (
                <Link
                  key={t.id}
                  href={`/tickets/${t.id}`}
                  className="block p-3 rounded-xl bg-sand/30 hover:bg-sand/60 border border-line transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-teal-dark">
                      {shortId(t.id)}
                    </span>
                    <Badge variant={t.urgency}>{t.urgency.replace("_", " ")}</Badge>
                  </div>
                  <div className="text-sm font-semibold text-ink truncate">{t.title}</div>
                  <div className="text-[11px] text-ink/60 mt-1 flex items-center justify-between">
                    <span>{t.residence || t.location || "Campus"}</span>
                    <span>{fmtTime(t.created_at)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-line">
            <h2 className="font-serif font-bold text-base text-ink">SMU Campus Hub</h2>
          </div>

          <div className="space-y-3">
            <Link
              href="/leaders"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-line bg-white hover:border-teal transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center text-teal shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-ink">Leaders Directory</div>
                <div className="text-xs text-ink/60">
                  Find House Committee, Res Managers, and SRC contacts.
                </div>
              </div>
            </Link>

            <Link
              href="/emergency"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-line bg-white hover:border-danger transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center text-danger shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-ink">Emergency SOS & Health Passport</div>
                <div className="text-xs text-ink/60">
                  Immediate emergency contacts and confidential medical profile.
                </div>
              </div>
            </Link>

            <Link
              href="/report"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-line bg-white hover:border-coral transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center text-coral shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-ink">Report Campus Maintenance</div>
                <div className="text-xs text-ink/60">
                  Submit photos and track automated SLA resolution.
                </div>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
