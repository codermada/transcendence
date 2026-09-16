"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
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
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div
          className="
            relative overflow-hidden
            rounded-2xl
            border border-border
            bg-surface/40
            p-6
            shadow-2xl
            shadow-black/20
            backdrop-blur-xl
            sm:p-8
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
              via-brand-500/50
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
                border border-brand-500/30
                bg-brand-500/10
                text-brand-400
                shadow-[0_0_20px_rgb(139_92_246_/_0.12)]
              "
            >
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                Two-factor authentication
              </h1>
              <p className="mt-1 text-xs leading-relaxed text-muted">
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
                className="block px-1 text-xs font-semibold uppercase tracking-wider text-muted"
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
                  border border-border
                  bg-background
                  px-3 py-2.5
                  text-center
                  font-mono
                  text-lg
                  tracking-[0.5em]
                  text-foreground
                  placeholder:text-muted
                  transition-colors
                  focus:border-brand-500/50
                  focus:outline-none
                  focus:ring-2
                  focus:ring-brand-500/20
                "
              />
            </div>

            <button
              type="submit"
              disabled={loading || !code}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
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
                text-muted
                transition-colors
                hover:text-brand-400
                focus:outline-none
                focus:ring-2
                focus:ring-brand-500/20
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
              border border-border
              bg-background/60
              px-3 py-2.5
              text-xs leading-relaxed text-muted
            "
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
            <span>
              Lost access to your authenticator?{" "}
              <a
                href="/support"
                className="font-medium text-brand-400 underline-offset-2 hover:underline"
              >
                Contact support
              </a>
              .
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}