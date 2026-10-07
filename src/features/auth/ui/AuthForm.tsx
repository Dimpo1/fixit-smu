"use client";

import React, { useState } from "react";
import { useAuth } from "../model/auth-context";
import { Button, Input, Select, Card } from "@/shared/ui";
import { RESIDENCES, ROLE_LABELS } from "@/entities/user";
import { VENDOR_CATEGORIES } from "@/entities/ticket";
import { UserRole } from "@/shared/api/supabase/types";

export const AuthForm: React.FC<{ onSuccess?: () => void }> = ({
  onSuccess,
}) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Signup fields
  const [role, setRole] = useState<UserRole>("student");
  const [fullName, setFullName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [residence, setResidence] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  // Vendor fields
  const [vendorCompany, setVendorCompany] = useState("");
  const [vendorCategory, setVendorCategory] = useState(VENDOR_CATEGORIES[0]);
  const [vendorResidence, setVendorResidence] = useState(RESIDENCES[0]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signin") {
        const res = await signIn(email, password);
        if (res.error) {
          setError(res.error);
        } else {
          onSuccess?.();
        }
      } else {
        // Validation
        if (role === "student" && !email.toLowerCase().endsWith("@smu.ac.za") && !email.toLowerCase().endsWith("@gmail.com")) {
          // Allow typical academic or personal emails during tests but validate presence
        }

        const res = await signUp(email, password, {
          role,
          fullName,
          studentNumber: role === "student" ? studentNumber : undefined,
          phone,
          residence: role === "student" ? residence : undefined,
          roomNumber: role === "student" ? roomNumber : undefined,
          vendorCompany: role === "vendor" ? vendorCompany : undefined,
          vendorCategory: role === "vendor" ? vendorCategory : undefined,
          vendorResidence: role === "vendor" ? vendorResidence : undefined,
        });

        if (res.error) {
          setError(res.error);
        } else {
          onSuccess?.();
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md w-full mx-auto shadow-md">
      <div className="flex border-b border-line mb-6 pb-2">
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setError("");
          }}
          className={`flex-1 py-2 text-sm font-semibold text-center border-b-2 transition-colors ${
            mode === "signin"
              ? "border-coral text-coral"
              : "border-transparent text-ink/50 hover:text-ink"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setError("");
          }}
          className={`flex-1 py-2 text-sm font-semibold text-center border-b-2 transition-colors ${
            mode === "signup"
              ? "border-coral text-coral"
              : "border-transparent text-ink/50 hover:text-ink"
          }`}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-danger text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        {mode === "signup" && (
          <>
            <Input
              label="Full Name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Lerato Mokoena"
            />

            <Select
              label="Your Role at SMU"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </Select>

            {role === "student" && (
              <>
                <Input
                  label="Student Number"
                  required
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  placeholder="e.g. 202401234"
                />
                <Select
                  label="Primary Residence"
                  required
                  value={residence}
                  onChange={(e) => setResidence(e.target.value)}
                >
                  <option value="">Select residence...</option>
                  {RESIDENCES.map((res) => (
                    <option key={res} value={res}>
                      {res}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Room Number"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. B-104"
                />
              </>
            )}

            {role === "vendor" && (
              <>
                <Input
                  label="Company Name"
                  required
                  value={vendorCompany}
                  onChange={(e) => setVendorCompany(e.target.value)}
                  placeholder="e.g. Pretoria Wi-Fi Solutions"
                />
                <Select
                  label="Contract Category"
                  value={vendorCategory}
                  onChange={(e) => setVendorCategory(e.target.value)}
                >
                  {VENDOR_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Assigned Residence / Campus"
                  value={vendorResidence}
                  onChange={(e) => setVendorResidence(e.target.value)}
                >
                  {RESIDENCES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              </>
            )}

            <Input
              label="Contact Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 082 123 4567"
            />
          </>
        )}

        <Input
          label="Email Address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.name@smu.ac.za"
        />

        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={loading}
          >
            {mode === "signin" ? "Sign In to Fixit SMU" : "Create Account"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
