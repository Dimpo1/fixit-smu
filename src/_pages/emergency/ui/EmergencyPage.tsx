"use client";

import React from "react";
import { PhoneCall, ShieldAlert, HeartPulse, Building2 } from "lucide-react";
import { Card } from "@/shared/ui";
import { EmergencyInfoForm } from "@/features/manage-emergency-info";

export const EmergencyPage: React.FC = () => {
  const hotlines = [
    {
      title: "SMU Campus Protection Services",
      number: "012 521 4444",
      desc: "24/7 Security Operations & Residence Escorts",
      icon: ShieldAlert,
    },
    {
      title: "SMU Campus Health Clinic",
      number: "012 521 4222",
      desc: "Emergency medical response & triage",
      icon: HeartPulse,
    },
    {
      title: "Ga-Rankuwa SAPS (Police)",
      number: "012 797 8800",
      desc: "Local police station & national flying squad (10111)",
      icon: Building2,
    },
    {
      title: "National Emergency Ambulance",
      number: "10177",
      desc: "Paramedic dispatch and patient transfer",
      icon: PhoneCall,
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          Emergency SOS & Health Passport
        </h1>
        <p className="text-sm text-ink/70 mt-1">
          Quick-dial hotlines for critical incidents and your confidential emergency health records.
        </p>
      </div>

      {/* SOS Banner & Hotlines */}
      <Card variant="sos">
        <h2 className="font-serif text-xl font-bold mb-1">
          🚨 Immediate Emergency Dial
        </h2>
        <p className="text-xs text-white/90 mb-4">
          Tap any number below to instantly connect with campus safety responders.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {hotlines.map((h, i) => {
            const Icon = h.icon;
            return (
              <a
                key={i}
                href={`tel:${h.number.replace(/\s+/g, "")}`}
                className="p-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">
                    {h.title}
                  </div>
                  <div className="font-mono text-base font-bold text-white mt-0.5">
                    {h.number}
                  </div>
                  <div className="text-[11px] text-white/80">{h.desc}</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-white text-coral flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
              </a>
            );
          })}
        </div>
      </Card>

      {/* Confidential Medical Profile Form */}
      <div>
        <EmergencyInfoForm />
      </div>
    </div>
  );
};
