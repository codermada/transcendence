"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";

import { AlertCircle, ShieldCheck } from "@/components/icons";

export default function TwoFactorPage() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!code) {
      toast.error("Enter an authentication code.");
      return;
    }

    setLoading(true);

    const { error } = useBackupCode
      ? await authClient.twoFactor.verifyBackupCode({ code })
      : await authClient.twoFactor.verifyTotp({ code });

    setLoading(false);

    if (error) {
      toast.error(error.message ?? "Invalid authentication code.");
      return;
    }

    toast.success("Two-factor authentication successful!");

    router.push("/feed");
  }

  function handleToggleCodeType() {
    setUseBackupCode((previous) => !previous);
    setCode("");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 bg-white text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-white">
      <div className="w-full max-w-md">
        <div
          className="
            relative overflow-hidden
            rounded-2xl
            border border-zinc-200 bg-zinc-50/80 shadow-xl shadow-zinc-200/50 backdrop-blur-xl
            dark:border-zinc-800 dark:bg-zinc-900/40 dark:shadow-2xl dark:shadow-black/20
            p-6 sm:p-8
            transition-colors
          "
        >
          {/* Futuristic top line */}
          <div
            aria-hidden
            className="
              pointer-events-none
              absolute inset-x-10 top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-violet-500/50
              to-transparent
              shadow-[0_0_14px_rgb(139_92_246_/_0.35)]
            "
          />
    
          {/* Icon + heading */}
          <div className="flex items-start gap-4">
            <div
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl
                border border-violet-500/30
                bg-violet-500/10
                text-violet-600 dark:text-violet-400
                shadow-[0_0_20px_rgb(139_92_246_/_0.12)]
              "
            >
              <ShieldCheck className="h-5 w-5" />
            </div>
      
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
                Two-factor authentication
              </h1>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                {useBackupCode
                  ? "Enter one of your backup codes to continue."
                  : "Enter the 6-digit code from your authenticator app."}
              </p>
            </div>
          </div>
                
          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="two-factor-code"
                className="block px-1 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
              >
                {useBackupCode ? "Backup code" : "Authentication code"}
              </label>
                
              <input
                id="two-factor-code"
                type="text"
                inputMode={useBackupCode ? "text" : "numeric"}
                autoComplete="one-time-code"
                autoFocus
                maxLength={useBackupCode ? undefined : 6}
                value={code}
                onChange={(e) =>
                  setCode(
                    useBackupCode
                      ? e.target.value
                      : e.target.value.replace(/\D/g, ""),
                  )
                }
                placeholder={useBackupCode ? "XXXXXXXX" : "000000"}
                className="
                  w-full rounded-xl
                  border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400
                  dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500
                  px-3 py-2.5
                  text-center
                  font-mono
                  text-lg
                  tracking-[0.5em]
                  transition-colors
                  focus:border-violet-500/50
                  focus:outline-none
                  focus:ring-2
                  focus:ring-violet-500/20
                "
              />
            </div>
              
            <button
              type="submit"
              disabled={loading || !code}
              className="
                w-full rounded-full bg-violet-600 py-2.5 text-sm font-medium text-white transition
                hover:bg-violet-500 active:bg-violet-700
                disabled:cursor-not-allowed disabled:opacity-50
              "
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span
                    aria-hidden
                    className="
                      h-3.5 w-3.5
                      animate-spin
                      rounded-full
                      border-2
                      border-white/30
                      border-t-white
                    "
                  />
                  Verifying…
                </span>
              ) : (
                "Verify"
              )}
            </button>
            
            <button
              type="button"
              onClick={handleToggleCodeType}
              disabled={loading}
              className="
                w-full
                text-center
                text-xs font-medium
                text-zinc-600 hover:text-violet-600
                dark:text-zinc-400 dark:hover:text-violet-400
                transition-colors
                focus:outline-none
                focus:ring-2
                focus:ring-violet-500/20
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {useBackupCode
                ? "Use authenticator code instead"
                : "Use a backup code instead"}
            </button>
          </form>
              
          {/* Help */}
          <div
            className="
              mt-6 flex items-start gap-3
              rounded-xl
              border border-zinc-200 bg-white/60
              dark:border-zinc-800 dark:bg-zinc-950/60
              px-3 py-2.5
              text-xs leading-relaxed text-zinc-600 dark:text-zinc-400
            "
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500 dark:text-zinc-400" />
            <span>
              Lost access to your authenticator?{" "}
              <Link
                href="/support"
                className="font-medium text-violet-600 hover:underline dark:text-violet-400 underline-offset-2"
              >
                Contact support
              </Link>
              .
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}