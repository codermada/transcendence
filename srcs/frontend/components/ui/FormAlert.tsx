"use client";

interface FormAlertProps {
  message?: string;
  type?: "error" | "success";
}

export function FormAlert({ message, type = "error" }: FormAlertProps) {
  if (!message) return null;

  const styles =
    type === "error"
      ? "border-red-900/50 bg-red-950/30 text-red-400"
      : "border-emerald-900/50 bg-emerald-950/30 text-emerald-400";

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${styles}`}
      role="alert"
    >
      {message}
    </div>
  );
}
