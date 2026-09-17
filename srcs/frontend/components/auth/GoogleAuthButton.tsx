"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { Google } from "@/components/icons"; // adjust path to match your project

type GoogleAuthButtonProps = {
  mode?: "signin" | "signup";
  callbackURL?: string;
};

export function GoogleAuthButton({
  mode = "signin",
  callbackURL = "/radio",
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });
    } finally {
      setLoading(false);
    }
  };

  const label =
    mode === "signup" ? "Sign up with Google" : "Continue with Google";

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-md border border-surface-border bg-surface px-4 py-2.5 text-sm font-medium text-surface-foreground transition-colors hover:border-violet-400/60 hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Google className="h-5 w-5 shrink-0" />
      <span>{loading ? "Redirecting..." : label}</span>
    </button>
  );
}