import React from "react";
import { cn } from "@/shared/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "sand" | "teal" | "sos";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-smuwhite border border-line rounded-2xl p-6 shadow-sm",
      sand: "bg-sand/40 border border-line rounded-2xl p-6",
      teal: "bg-teal-dark text-white rounded-2xl p-6",
      sos: "bg-gradient-to-br from-coral to-coral-dark text-white rounded-2xl p-6 shadow-md",
    };

    return (
      <div ref={ref} className={cn(variants[variant], className)} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
