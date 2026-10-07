"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, HeartPulse, PhoneCall } from "lucide-react";
import { useAuth } from "@/features/auth";
import {
  fetchHealthInfo,
  fetchEmergencyContacts,
  saveHealthAndContacts,
} from "@/entities/health";
import { HealthInfo, EmergencyContact } from "@/shared/api/supabase/types";
import { Button, Input, Select, Textarea, Card, useToast } from "@/shared/ui";

const BLOOD_TYPES = ["Unknown", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const EmergencyInfoForm: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bloodType, setBloodType] = useState("Unknown");
  const [allergies, setAllergies] = useState("");
  const [chronicConditions, setChronicConditions] = useState("");
  const [medicalAidName, setMedicalAidName] = useState("");
  const [medicalAidNumber, setMedicalAidNumber] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const [contacts, setContacts] = useState<
    Omit<EmergencyContact, "id" | "user_id">[]
  >([]);

  useEffect(() => {
    if (!profile?.id) return;
    setLoading(true);
    Promise.all([
      fetchHealthInfo(profile.id),
      fetchEmergencyContacts(profile.id),
    ]).then(([h, cList]) => {
      if (h) {
        setBloodType(h.blood_type || "Unknown");
        setAllergies(h.allergies || "");
        setChronicConditions(h.chronic_conditions || "");
        setMedicalAidName(h.medical_aid_name || "");
        setMedicalAidNumber(h.medical_aid_number || "");
        setSpecialInstructions(h.special_instructions || "");
      }
      if (cList && cList.length > 0) {
        setContacts(
          cList.map((c) => ({
            name: c.name,
            relationship: c.relationship,
            phone: c.phone,
          }))
        );
      } else {
        setContacts([{ name: "", relationship: "Parent / Guardian", phone: "" }]);
      }
      setLoading(false);
    });
  }, [profile?.id]);

  const addContact = () => {
    setContacts((prev) => [
      ...prev,
      { name: "", relationship: "Family", phone: "" },
    ]);
  };

  const removeContact = (idx: number) => {
    setContacts((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateContact = (
    idx: number,
    field: "name" | "relationship" | "phone",
    val: string
  ) => {
    setContacts((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    setSaving(true);
    const healthPayload: Partial<HealthInfo> = {
      blood_type: bloodType,
      allergies,
      chronic_conditions: chronicConditions,
      medical_aid_name: medicalAidName,
      medical_aid_number: medicalAidNumber,
      special_instructions: specialInstructions,
    };

    const res = await saveHealthAndContacts(profile.id, healthPayload, contacts);
    setSaving(false);

    if (res.success) {
      toast("Medical profile and emergency contacts saved", "success");
    } else {
      toast(res.error || "Failed to save profile", "error");
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-ink/60">
        Loading emergency profile...
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-sm">
      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-line">
          <HeartPulse className="w-5 h-5 text-danger" />
          <h2 className="font-serif text-lg font-semibold text-ink">
            Medical Emergency Profile
          </h2>
        </div>
        <p className="text-xs text-ink/70">
          This information is only displayed to SMU Campus Clinic and emergency
          first responders during an active 🚨 Health Emergency report.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Blood Type"
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
          >
            {BLOOD_TYPES.map((bt) => (
              <option key={bt} value={bt}>
                {bt}
              </option>
            ))}
          </Select>

          <Input
            label="Medical Aid Scheme"
            value={medicalAidName}
            onChange={(e) => setMedicalAidName(e.target.value)}
            placeholder="e.g. Discovery Health / None"
          />
        </div>

        <Input
          label="Medical Aid Number"
          value={medicalAidNumber}
          onChange={(e) => setMedicalAidNumber(e.target.value)}
          placeholder="e.g. 1234567890"
        />

        <Textarea
          label="Known Allergies (Medications, Foods, Insects)"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          placeholder="e.g. Penicillin, Peanuts"
        />

        <Textarea
          label="Chronic Conditions & Current Medications"
          value={chronicConditions}
          onChange={(e) => setChronicConditions(e.target.value)}
          placeholder="e.g. Asthma (uses Ventolin inhaler)"
        />

        <Textarea
          label="Special Emergency Instructions"
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder="Any urgent notes for paramedics"
        />

        {/* Emergency Contacts Section */}
        <div className="pt-4 border-t border-line">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-teal" />
              <h3 className="font-serif text-base font-semibold text-ink">
                Emergency Next-of-Kin Contacts
              </h3>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addContact}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Contact
            </Button>
          </div>

          <div className="space-y-3">
            {contacts.map((c, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-sand/30 border border-line flex flex-col sm:flex-row gap-3 items-end"
              >
                <div className="w-full sm:flex-1">
                  <Input
                    label="Contact Name"
                    required
                    value={c.name}
                    onChange={(e) => updateContact(idx, "name", e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="w-full sm:w-36">
                  <Input
                    label="Relationship"
                    required
                    value={c.relationship}
                    onChange={(e) =>
                      updateContact(idx, "relationship", e.target.value)
                    }
                    placeholder="e.g. Mother"
                  />
                </div>
                <div className="w-full sm:w-44">
                  <Input
                    label="Phone Number"
                    type="tel"
                    required
                    value={c.phone}
                    onChange={(e) => updateContact(idx, "phone", e.target.value)}
                    placeholder="082 123 4567"
                  />
                </div>
                {contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContact(idx)}
                    className="p-2 mb-3.5 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-line">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={saving}
            className="w-full"
          >
            Save Emergency Passport
          </Button>
        </div>
      </form>
    </Card>
  );
};
