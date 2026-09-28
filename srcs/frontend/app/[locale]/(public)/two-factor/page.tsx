"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";

import { AlertCircle, ShieldCheck } from "@/components/icons";

export default function TwoFactorPage() {
  const router = useRouter();
  const t = useTranslations("TwoFactor.signIn");

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!code) {
      toast.error(t("toast.enterCode"));
      return;
    }

    setLoading(true);

    const { error } = useBackupCode
      ? await authClient.twoFactor.verifyBackupCode({ code })
      : await authClient.twoFactor.verifyTotp({ code });

    setLoading(false);

    if (error) {
      toast.error(error.message ?? t("toast.invalidCode"));
      return;
    }

    toast.success(t("toast.success"));

    router.push("/feed");
  }

  function handleToggleCodeType() {
    setUseBackupCode((previous) => !previous);
    setCode("");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 transition-colors">
      <div className="w-full max-w-md">
        <div
          className="
            bg-surface border-border
            relative overflow-hidden
            rounded-2xl border
            shadow-2xl shadow-black/20 backdrop-blur-xl
            p-6 sm:p-8
            transition-colors
          "
        >
          {/* Futuristic top line */}
          <div
            aria-hidden
            className="
              from-transparent via-brand-500/50 to-transparent
              pointer-events-none
              absolute inset-x-10 top-0
              h-px
              bg-gradient-to-r
              shadow-[0_0_14px_rgb(139_92_246_/_0.35)]
            "
          />

          {/* Icon + heading */}
          <div className="flex items-start gap-4">
            <div
              className="
                border-brand-500/30 bg-brand-500/10 text-brand-400
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl
                border
                shadow-[0_0_20px_rgb(139_92_246_/_0.12)]
              "
            >
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                {t("title")}
              </h1>
              <p className="text-muted mt-1 text-xs leading-relaxed">
                {useBackupCode
                  ? t("descriptionBackup")
                  : t("descriptionTotp")}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="two-factor-code"
                className="text-muted block px-1 text-xs font-semibold uppercase tracking-wider"
              >
                {useBackupCode ? t("labelBackup") : t("labelTotp")}
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
                placeholder={
                  useBackupCode ? t("placeholderBackup") : t("placeholderTotp")
                }
                className="
                  bg-background border-border placeholder:text-muted
                  focus:border-brand-500/50 focus:ring-brand-500/20
                  w-full rounded-xl border
                  px-3 py-2.5
                  text-center
                  font-mono
                  text-lg
                  tracking-[0.5em]
                  transition-colors
                  focus:outline-none
                  focus:ring-2
                "
              />
            </div>

            <button
              type="submit"
              disabled={loading || !code}
              className="
                bg-brand-600 hover:bg-brand-500 active:bg-brand-700
                w-full rounded-full
                py-2.5
                text-sm font-medium text-white
                transition
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
                  {t("submitting")}
                </span>
              ) : (
                t("submit")
              )}
            </button>

            <button
              type="button"
              onClick={handleToggleCodeType}
              disabled={loading}
              className="
                text-muted hover:text-brand-400 focus:ring-brand-500/20
                w-full
                text-center
                text-xs font-medium
                transition-colors
                focus:outline-none
                focus:ring-2
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {useBackupCode ? t("switchToTotp") : t("switchToBackup")}
            </button>
          </form>

          {/* Help */}
          <div
            className="
              border-border bg-background/60 text-muted
              mt-6 flex items-start gap-3
              rounded-xl border
              px-3 py-2.5
              text-xs leading-relaxed
            "
          >
            <AlertCircle className="text-muted mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              {t("help.prefix")}{" "}
              <Link
                href="/support"
                className="text-brand-400 underline-offset-2 font-medium hover:underline"
              >
                {t("help.link")}
              </Link>
              {t("help.suffix")}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}