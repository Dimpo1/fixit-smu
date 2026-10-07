import React from "react";
import { cn } from "@/shared/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, error, id, options, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full mb-3.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-teal-dark/70 mb-1.5"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "w-full px-3.5 py-2.5 bg-white border border-line rounded-lg text-sm text-ink transition-colors appearance-none",
            "focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal",
            "disabled:bg-sand/30 disabled:cursor-not-allowed",
            "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] bg-no-repeat",
            error && "border-danger focus:border-danger focus:ring-danger",
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%237c867f'><path d='M5.5 7.5l4.5 4.5 4.5-4.5' stroke='%237c867f' stroke-width='1.5' fill='none'/></svg>")`,
            backgroundPosition: "right 12px center",
            backgroundSize: "16px 16px",
            paddingRight: "36px",
          }}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {hint && !error && <p className="text-xs text-ink/60 mt-1">{hint}</p>}
        {error && <p className="text-xs text-danger font-medium mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
