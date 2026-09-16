import { ReactNode, useId } from "react";

interface FieldProps {
  label: string;
  /** Rendered below the input as muted helper text */
  help?: ReactNode;
  /** Rendered below the input in the danger color */
  error?: string | null;
  required?: boolean;
  /** Optional description shown after the label, e.g. "(optional)" */
  hint?: string;
  /** Optional icon rendered before the label text */
  icon?: ReactNode;
  /** Extra classes for the wrapper */
  className?: string;
  children: (props: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
  }) => ReactNode;
}

export function Field({
  label,
  help,
  error,
  required,
  hint,
  icon,
  className = "",
  children,
}: FieldProps) {
  const id = useId();
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const describedBy =
    [errorId, helpId].filter(Boolean).join(" ") || undefined;

  const hasError = Boolean(error);

  return (
    <div className={`group space-y-2 ${className}`}>
      {/* Label row */}
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-subtle transition-colors group-focus-within:text-foreground"
        >
          {icon && (
            <span className="text-muted transition-colors group-focus-within:text-accent-text">
              {icon}
            </span>
          )}
          {label}
          {required && (
            <span
              aria-hidden
              className="text-danger leading-none"
              title="Required"
            >
              *
            </span>
          )}
        </label>

        {hint && (
          <span className="text-xs font-normal text-faint">{hint}</span>
        )}
      </div>

      {/* Input slot */}
      <div
        className={
          hasError
            ? "[&_.input-field]:border-danger/60 [&_.input-field]:focus:border-danger [&_.input-field]:focus:ring-danger/20"
            : ""
        }
      >
        {children({
          id,
          "aria-describedby": describedBy,
          "aria-invalid": hasError || undefined,
        })}
      </div>

      {/* Help / Error message */}
      <div className="min-h-[1.125rem]">
        {hasError ? (
          <p
            id={errorId}
            role="alert"
            className="flex items-start gap-1.5 text-xs font-medium text-danger"
          >
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
              fill="currentColor"
            >
              <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0 3a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4.5Zm0 7.5a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75Z" />
            </svg>
            <span>{error}</span>
          </p>
        ) : help ? (
          <p id={helpId} className="text-xs leading-relaxed text-faint">
            {help}
          </p>
        ) : null}
      </div>
    </div>
  );
}