"use client";

import { forwardRef, InputHTMLAttributes, ReactNode } from "react";

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightLabel?: ReactNode;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, rightLabel, id, className = "", ...props }, ref) => {
    return (
      <div>
        {(label || rightLabel) && (
          <div className="mb-2 flex items-center justify-between">
            {label && (
              <label
                htmlFor={id}
                className="block text-sm font-medium text-zinc-300"
              >
                {label}
              </label>
            )}
            {rightLabel}
          </div>
        )}

        <input
          id={id}
          ref={ref}
          className={`w-full rounded-lg border bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 transition ${
            error
              ? "border-red-500/60 focus:border-red-500"
              : "border-zinc-800 focus:border-violet-500"
          } ${className}`}
          {...props}
        />

        {error && (
          <p className="mt-1.5 text-xs text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";
