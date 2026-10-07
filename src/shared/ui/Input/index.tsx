import React from "react";
import { cn } from "@/shared/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full mb-3.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-teal-dark/70 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full px-3.5 py-2.5 bg-white border border-line rounded-lg text-sm text-ink transition-colors",
            "focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal",
            "placeholder:text-ink/40 disabled:bg-sand/30 disabled:cursor-not-allowed",
            error && "border-danger focus:border-danger focus:ring-danger",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-ink/60 mt-1">{hint}</p>}
        {error && <p className="text-xs text-danger font-medium mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
