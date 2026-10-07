import React from "react";
import { cn } from "@/shared/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "open"
    | "resolved"
    | "closed"
    | "low"
    | "medium"
    | "high"
    | "health_emergency"
    | "neutral";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  children,
  ...props
}) => {
  const variants = {
    open: "bg-[#FCEFE9] text-coral border border-coral/20",
    resolved: "bg-[#E7F1EA] text-[#2E7D4F] border border-[#2E7D4F]/20",
    closed: "bg-sand text-ink/60 border border-line",
    low: "bg-[#EEF3F1] text-[#5b6a65]",
    medium: "bg-[#FBF1DD] text-gold",
    high: "bg-[#FBE7E3] text-danger font-semibold",
    health_emergency: "bg-danger text-white font-bold animate-pulse",
    neutral: "bg-sand/60 text-ink/70",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
