"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth/auth-client";
import { Google } from "@/components/icons";

type GoogleAuthButtonProps = {
  mode?: "signin" | "signup";
  callbackURL?: string;
};

export function GoogleAuthButton({
  mode = "signin",
  callbackURL = "/radio",
}: GoogleAuthButtonProps) {
  const t = useTranslations("Auth.Google");
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

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200/80 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-xs transition-colors hover:border-zinc-300 hover:bg-zinc-100/80 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300 dark:shadow-none dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white dark:focus:ring-offset-zinc-950"
    >
      <Google className="h-5 w-5 shrink-0" />
      <span>{loading ? t("redirecting") : t(mode === "signup" ? "signUp" : "signIn")}</span>
    </button>
  );
}