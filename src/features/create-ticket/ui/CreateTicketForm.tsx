"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Camera, Trash2, Home, Building2 } from "lucide-react";
import { useAuth } from "@/features/auth";
import { Button, Input, Select, Textarea, Card, useToast } from "@/shared/ui";
import {
  CATEGORIES,
  URGENCY_LABELS,
  createTicket,
} from "@/entities/ticket";
import { RESIDENCES, CAMPUS_LOCATIONS, OTHER_VAL } from "@/entities/user";
import { IssueType, UrgencyLevel } from "@/shared/api/supabase/types";

export const CreateTicketForm: React.FC = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [issueType, setIssueType] = useState<IssueType>("residence");
  const [residence, setResidence] = useState(profile?.residence || "");
  const [otherResidence, setOtherResidence] = useState("");
  const [roomNumber, setRoomNumber] = useState(profile?.room_number || "");
  const [location, setLocation] = useState("");
  const [otherLocation, setOtherLocation] = useState("");

  const [category, setCategory] = useState(CATEGORIES[0]);
  const [otherCategory, setOtherCategory] = useState("");
  const [urgency, setUrgency] = useState<UrgencyLevel>("medium");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newItems = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newItems].slice(0, 4));
  };

  const handlePhotoRemove = (index: number) => {
    setPhotos((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      toast("Please sign in first to report an issue", "error");
      return;
    }

    setError("");
    setSubmitting(true);

    const finalResidence =
      issueType === "residence"
        ? residence === OTHER_VAL
          ? otherResidence
          : residence
        : undefined;

    const finalLocation =
      issueType === "campus"
        ? location === OTHER_VAL
          ? otherLocation
          : location
        : undefined;

    const finalCategory = category;
    const finalCustomCategory =
      category === "Other" ? otherCategory : undefined;

    try {
      const res = await createTicket(profile, {
        issue_type: issueType,
        category: finalCategory,
        custom_category: finalCustomCategory,
        title,
        description,
        residence: finalResidence,
        room_number: issueType === "residence" ? roomNumber : undefined,
        location: finalLocation,
        urgency,
        photos: photos.map((p) => p.file),
      });

      if (res.success && res.ticket) {
        toast("Report submitted successfully!", "success");
        router.push(`/tickets/${res.ticket.id}`);
      } else {
        setError(res.error || "Failed to create ticket");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-danger text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Step 1: Location Type */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-teal-dark/70 mb-2">
            Where is the issue?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIssueType("residence")}
              className={`p-3.5 rounded-xl border-2 flex items-center gap-3 text-left transition-all ${
                issueType === "residence"
                  ? "border-coral bg-coral-light/60 text-coral font-bold"
                  : "border-line bg-white text-ink/70 hover:border-teal"
              }`}
            >
              <Home className="w-5 h-5 shrink-0" />
              <div>
                <div className="text-sm">Student Residence</div>
                <div className="text-xs opacity-75 font-normal">
                  Rooms, blocks & halls
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIssueType("campus")}
              className={`p-3.5 rounded-xl border-2 flex items-center gap-3 text-left transition-all ${
                issueType === "campus"
                  ? "border-coral bg-coral-light/60 text-coral font-bold"
                  : "border-line bg-white text-ink/70 hover:border-teal"
              }`}
            >
              <Building2 className="w-5 h-5 shrink-0" />
              <div>
                <div className="text-sm">Campus Facility</div>
                <div className="text-xs opacity-75 font-normal">
                  Labs, clinic, library & grounds
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Location Specifics */}
        {issueType === "residence" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Select
                label="Residence Name"
                required
                value={residence}
                onChange={(e) => setResidence(e.target.value)}
              >
                <option value="">Select residence...</option>
                {RESIDENCES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
              {residence === OTHER_VAL && (
                <Input
                  label="Specify Residence"
                  required
                  value={otherResidence}
                  onChange={(e) => setOtherResidence(e.target.value)}
                  placeholder="Enter residence name"
                />
              )}
            </div>
            <Input
              label="Room / Unit Number"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. 214"
            />
          </div>
        ) : (
          <div>
            <Select
              label="Campus Location"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">Select location...</option>
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </Select>
            {location === OTHER_VAL && (
              <Input
                label="Specify Campus Location"
                required
                value={otherLocation}
                onChange={(e) => setOtherLocation(e.target.value)}
                placeholder="e.g. Near Lecture Hall 3 entrance"
              />
            )}
          </div>
        )}

        {/* Category */}
        <div>
          <Select
            label="Issue Category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
          {category === "Other" && (
            <Input
              label="Custom Category"
              required
              value={otherCategory}
              onChange={(e) => setOtherCategory(e.target.value)}
              placeholder="Describe category"
            />
          )}
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-teal-dark/70 mb-2">
            Urgency & Priority
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(["low", "medium", "high", "health_emergency"] as UrgencyLevel[]).map(
              (lvl) => {
                const isSelected = urgency === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setUrgency(lvl)}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all ${
                      isSelected
                        ? lvl === "health_emergency"
                          ? "bg-danger text-white border-danger shadow-md scale-102"
                          : lvl === "high"
                          ? "bg-red-50 text-danger border-danger"
                          : lvl === "medium"
                          ? "bg-amber-50 text-gold border-gold"
                          : "bg-slate-100 text-ink/80 border-slate-400"
                        : "bg-white border-line text-ink/70 hover:border-teal"
                    }`}
                  >
                    {URGENCY_LABELS[lvl]}
                  </button>
                );
              }
            )}
          </div>
          {urgency === "health_emergency" && (
            <div className="mt-2.5 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>SLA 30 Mins:</strong> Campus emergency officers & health
                contacts will be alerted immediately.
              </span>
            </div>
          )}
        </div>

        {/* Title & Description */}
        <Input
          label="Summary / Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Geyser leaking heavily in 2nd floor corridor"
        />

        <Textarea
          label="Detailed Description"
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please explain the problem and any hazards or context..."
        />

        {/* Photos */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-teal-dark/70 mb-2">
            Attach Photos (Up to 4)
          </label>
          <div className="flex flex-wrap gap-3">
            {photos.map((p, idx) => (
              <div
                key={idx}
                className="relative w-20 h-20 rounded-xl overflow-hidden border border-line group"
              >
                <img
                  src={p.preview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handlePhotoRemove(idx)}
                  className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </div>
            ))}

            {photos.length < 4 && (
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-line hover:border-teal bg-white/70 flex flex-col items-center justify-center cursor-pointer text-ink/50 hover:text-teal transition-colors">
                <Camera className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoAdd}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-line">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={submitting}
            className="w-full"
          >
            Submit Incident Report
          </Button>
        </div>
      </form>
    </Card>
  );
};
