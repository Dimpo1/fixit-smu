"use client";

import React, { useState, useEffect } from "react";
import { Search, ShieldAlert, UserCheck, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/features/auth";
import { searchProfiles, updateProfile } from "@/entities/user";
import { Profile, UserRole, ApprovedPartnerEmail } from "@/shared/api/supabase/types";
import { getSupabase } from "@/shared/api/supabase/client";
import { Button, Input, Select, Card, Badge, useToast } from "@/shared/ui";
import { RESIDENCES, ROLE_LABELS } from "@/entities/user";

export const AdminUserPanel: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  // Edit fields
  const [editRole, setEditRole] = useState<UserRole>("student");
  const [editResidence, setEditResidence] = useState("");
  const [savingUser, setSavingUser] = useState(false);

  // Whitelist
  const [partners, setPartners] = useState<ApprovedPartnerEmail[]>([]);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partnerCompany, setPartnerCompany] = useState("");
  const [addingPartner, setAddingPartner] = useState(false);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb
      .from("approved_partner_emails")
      .select("*")
      .order("added_at", { ascending: false });
    if (data) setPartners(data as ApprovedPartnerEmail[]);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    const results = await searchProfiles(query);
    setUsers(results);
    setSearching(false);
  };

  const handleSelectUser = (u: Profile) => {
    setSelectedUser(u);
    setEditRole(u.role);
    setEditResidence(u.residence || "");
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;
    setSavingUser(true);
    const res = await updateProfile(selectedUser.id, {
      role: editRole,
      residence: editResidence || null,
    });
    setSavingUser(false);

    if (res.success) {
      toast(`Updated role for ${selectedUser.email}`, "success");
      setSelectedUser((prev) =>
        prev ? { ...prev, role: editRole, residence: editResidence } : null
      );
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, role: editRole, residence: editResidence }
            : u
        )
      );
    } else {
      toast(res.error || "Update failed", "error");
    }
  };

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb || !partnerEmail.trim()) return;

    setAddingPartner(true);
    const { error } = await sb.from("approved_partner_emails").insert({
      email: partnerEmail.trim().toLowerCase(),
      company: partnerCompany.trim() || null,
    });
    setAddingPartner(false);

    if (error) {
      toast(error.message, "error");
    } else {
      toast("Partner added to approved whitelist", "success");
      setPartnerEmail("");
      setPartnerCompany("");
      loadPartners();
    }
  };

  const handleRemovePartner = async (email: string) => {
    const sb = getSupabase();
    if (!sb) return;
    const { error } = await sb
      .from("approved_partner_emails")
      .delete()
      .eq("email", email);

    if (error) {
      toast(error.message, "error");
    } else {
      toast("Partner removed", "info");
      loadPartners();
    }
  };

  if (profile?.role !== "residence_manager" && profile?.role !== "src") {
    return (
      <Card className="max-w-xl mx-auto text-center py-10">
        <ShieldAlert className="w-10 h-10 text-danger mx-auto mb-3" />
        <h3 className="font-serif text-lg font-bold text-ink">
          Restricted Access
        </h3>
        <p className="text-xs text-ink/70 mt-1">
          This portal requires SMU Residence Manager or SRC leadership credentials.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* User Search & Role Assignment */}
      <Card>
        <h2 className="font-serif text-lg font-bold text-ink mb-4">
          Campus Directory & Role Management
        </h2>
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by student number, name, or SMU email..."
            />
          </div>
          <Button type="submit" variant="primary" isLoading={searching}>
            <Search className="w-4 h-4 mr-1" />
            Search
          </Button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Results List */}
          <div className="space-y-2 border border-line rounded-xl p-3 max-h-80 overflow-y-auto">
            {users.length === 0 ? (
              <p className="text-xs text-ink/50 text-center py-8">
                Search for a user to manage their campus roles.
              </p>
            ) : (
              users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                    selectedUser?.id === u.id
                      ? "border-coral bg-coral-light/50"
                      : "border-line bg-white hover:border-teal"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>{u.full_name || u.email}</span>
                    <Badge variant="neutral">{ROLE_LABELS[u.role]}</Badge>
                  </div>
                  <div className="text-[11px] text-ink/60 mt-1">
                    {u.student_number && `No: ${u.student_number} · `}
                    {u.residence || "No residence"}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* User Role Editor */}
          <div className="p-4 rounded-xl bg-sand/30 border border-line">
            {selectedUser ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-line">
                  <UserCheck className="w-5 h-5 text-teal" />
                  <span className="font-semibold text-sm text-ink truncate">
                    {selectedUser.full_name || selectedUser.email}
                  </span>
                </div>

                <Select
                  label="Assigned Role"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                >
                  {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Residence Assignment"
                  value={editResidence}
                  onChange={(e) => setEditResidence(e.target.value)}
                >
                  <option value="">None / Campus-wide</option>
                  {RESIDENCES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>

                <Button
                  variant="primary"
                  size="sm"
                  isLoading={savingUser}
                  onClick={handleSaveRole}
                  className="w-full"
                >
                  Update User Permissions
                </Button>
              </div>
            ) : (
              <p className="text-xs text-ink/50 text-center py-12">
                Select a user from the results list to view and edit roles.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* External Vendor Whitelist */}
      <Card>
        <h2 className="font-serif text-lg font-bold text-ink mb-2">
          Approved External Vendors & Contractors Whitelist
        </h2>
        <p className="text-xs text-ink/70 mb-4">
          Only vendor emails listed here can register as external contractors on Fixit SMU.
        </p>

        <form onSubmit={handleAddPartner} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 items-end">
          <Input
            label="Partner Email"
            type="email"
            required
            value={partnerEmail}
            onChange={(e) => setPartnerEmail(e.target.value)}
            placeholder="contractor@company.co.za"
          />
          <Input
            label="Company / Specialty"
            value={partnerCompany}
            onChange={(e) => setPartnerCompany(e.target.value)}
            placeholder="e.g. Pretoria Wi-Fi Solutions"
          />
          <div className="mb-3.5">
            <Button type="submit" variant="primary" size="md" isLoading={addingPartner} className="w-full">
              <Plus className="w-4 h-4 mr-1" />
              Add Partner
            </Button>
          </div>
        </form>

        <div className="space-y-2">
          {partners.map((p) => (
            <div
              key={p.email}
              className="flex items-center justify-between p-3 rounded-xl bg-white border border-line"
            >
              <div>
                <div className="text-xs font-semibold text-ink">{p.email}</div>
                {p.company && (
                  <div className="text-[11px] text-ink/60">{p.company}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemovePartner(p.email)}
                className="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
