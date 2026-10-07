import React from "react";
import { cn } from "@/shared/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, id, rows = 3, ...props }, ref) => {
    const areaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full mb-3.5 text-left">
        {label && (
          <label
            htmlFor={areaId}
            className="block text-xs font-semibold uppercase tracking-wider text-teal-dark/70 mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          id={areaId}
          ref={ref}
          rows={rows}
          className={cn(
            "w-full px-3.5 py-2.5 bg-white border border-line rounded-lg text-sm text-ink transition-colors resize-y min-h-[80px]",
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

Textarea.displayName = "Textarea";
