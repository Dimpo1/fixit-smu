"use client";

import React, { useState, useEffect } from "react";
import { Phone, Users, Shield } from "lucide-react";
import { fetchLeaders, DEMO_LEADERS, LeaderContact, ROLE_LABELS } from "@/entities/user";
import { Card, Input, Badge } from "@/shared/ui";
import { UserRole } from "@/shared/api/supabase/types";

export const LeadersPage: React.FC = () => {
  const [leaders, setLeaders] = useState<LeaderContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLeaders().then((dbLeaders) => {
      const mappedDb: LeaderContact[] = dbLeaders.map((p) => ({
        name: p.full_name || p.email,
        role: p.role,
        residence: p.residence || p.vendor_company || "Campus-wide",
        phone: p.phone || "—",
        isDemo: false,
      }));

      // Combine with DEMO_LEADERS
      const combined = [...mappedDb, ...DEMO_LEADERS];
      setLeaders(combined);
      setLoading(false);
    });
  }, []);

  const filtered = leaders.filter((l) => {
    if (filterRole !== "all" && l.role !== filterRole) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const n = l.name.toLowerCase();
      const r = (l.residence || "").toLowerCase();
      const p = l.phone.toLowerCase();
      if (!n.includes(q) && !r.includes(q) && !p.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          SMU Leadership & Residence Contacts
        </h1>
        <p className="text-sm text-ink/70 mt-1">
          Direct directory for House Committees, Residence Managers, and Student Representative Council.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by leader name, residence, or role..."
          />
        </div>
        <div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-line rounded-lg text-sm text-ink"
          >
            <option value="all">All Roles</option>
            <option value="house_committee">House Committee</option>
            <option value="residence_manager">Residence Managers</option>
            <option value="src">SRC Members</option>
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-sm text-ink/60">
            Loading campus leadership directory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-sm text-ink/60">
            No contacts match the selected criteria.
          </div>
        ) : (
          filtered.map((l, i) => (
            <Card key={i} className="p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="neutral">
                    {ROLE_LABELS[l.role] || l.role}
                  </Badge>
                  {l.isDemo && (
                    <span className="text-[10px] text-ink/40 uppercase">Directory</span>
                  )}
                </div>
                <h3 className="font-semibold text-base text-ink">{l.name}</h3>
                <p className="text-xs text-ink/60 mt-1">
                  📍 {l.residence || "SMU Campus"}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-line flex items-center justify-between">
                <span className="font-mono text-xs text-ink/80">{l.phone}</span>
                {l.phone && l.phone !== "—" && (
                  <a
                    href={`tel:${l.phone.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal/10 hover:bg-teal hover:text-white text-teal text-xs font-semibold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call
                  </a>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
