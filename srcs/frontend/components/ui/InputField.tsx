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
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
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
          className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-xs outline-none transition placeholder:text-zinc-400 focus:ring-2 dark:bg-zinc-900/50 dark:text-white dark:shadow-none dark:placeholder:text-zinc-500 ${
            error
              ? "border-red-500/80 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500/60"
              : "border-zinc-200/80 focus:border-violet-500 focus:ring-violet-500/20 dark:border-zinc-800 dark:focus:border-violet-500"
          } ${className}`}
          {...props}
        />

        {error && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";
