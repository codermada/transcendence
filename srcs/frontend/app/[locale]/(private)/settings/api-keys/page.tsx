"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

import { authClient } from "@/lib/auth/auth-client";
import { PageShell } from "@/components/layout/PageShell";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";

type GeneratedKey = {
  id: string;
  name: string;
  key: string;
  expiresAt: Date | null;
};

export default function CreateApiKeyPage() {
  const router = useRouter();
  const t = useTranslations("Settings.apiKeys");

  const [name, setName] = useState("My Frontend App Key");
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] =
    useState<GeneratedKey | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) return;

    setIsLoading(true);
    setError(null);

    try {
      const days = Math.max(0, Math.floor(expiresInDays));

      const { data, error } = await authClient.apiKey.create({
        name: trimmedName,
        expiresIn: days > 0 ? days * 24 * 60 * 60 : undefined,
        metadata: {
          environment: process.env.NODE_ENV ?? "development",
        },
      });

      if (error) {
        setError(error.message ?? t("errorFailed"));
        return;
      }

      if (!data) {
        setError(t("errorNoKey"));
        return;
      }

      setGeneratedKey({
        id: data.id,
        name: data.name ?? trimmedName,
        key: data.key,
        expiresAt: data.expiresAt ?? null,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("errorUnexpected")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedKey) return;

    try {
      await navigator.clipboard.writeText(generatedKey.key);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError(t("errorFailed"));
    }
  };

  // ============================================================
  // Generated key screen
  // ============================================================

  if (generatedKey) {
    return (
      <PageShell
        title={t("createdTitle")}
        subtitle={t("copyWarning")}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          {/* Success */}
          <div
            className="
              relative overflow-hidden
              rounded-2xl
              border border-violet-200/80 bg-violet-50/50 p-5 shadow-xs transition-colors
              dark:border-violet-500/20 dark:bg-violet-500/[0.04] dark:shadow-none
            "
          >
            <div
              aria-hidden
              className="
                pointer-events-none
                absolute inset-0
                bg-gradient-to-r from-violet-200/20 via-transparent to-transparent
                opacity-60 dark:opacity-40
              "
            />

            <div className="relative flex items-start gap-4">
              <div
                className="
                  flex h-10 w-10 shrink-0
                  items-center justify-center
                  rounded-xl
                  border border-violet-200 bg-violet-100 text-violet-700
                  shadow-xs
                  dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-400
                  dark:shadow-[0_0_20px_rgb(139_92_246_/_0.12)]
                "
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m5 12 4 4L19 6"
                  />
                </svg>
              </div>

              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {t("createdTitle")}
                </p>

                <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {t("copyWarning")}
                </p>
              </div>
            </div>
          </div>

          {/* API key */}
          <section className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                API Key
              </span>

              <span className="text-[10px] font-medium uppercase tracking-wider text-violet-600 dark:text-violet-400">
                Secret
              </span>
            </div>

            <div
              className="
                relative overflow-hidden
                rounded-xl
                border border-zinc-200 bg-white p-3 transition-colors
                dark:border-zinc-800 dark:bg-zinc-950
              "
            >
              <div
                aria-hidden
                className="
                  pointer-events-none
                  absolute left-4 right-4 top-0
                  h-px
                  bg-gradient-to-r
                  from-transparent
                  via-violet-500/60
                  to-transparent
                "
              />

              <div className="flex items-center gap-3">
                <code
                  className="
                    min-w-0 flex-1
                    break-all
                    font-mono
                    text-xs
                    leading-relaxed
                    text-zinc-900 dark:text-zinc-200
                  "
                >
                  {generatedKey.key}
                </code>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="
                    shrink-0
                    rounded-lg
                    border border-violet-200 bg-violet-50 px-3 py-2
                    text-xs font-semibold text-violet-700
                    transition-all
                    hover:bg-violet-100 hover:text-violet-800
                    dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-400
                    dark:hover:border-violet-500/50 dark:hover:bg-violet-500/15 dark:hover:text-violet-300
                    focus:outline-none
                    focus:ring-2
                    focus:ring-violet-500/20
                  "
                >
                  {copied ? t("copied") : t("copy")}
                </button>
              </div>
            </div>
          </section>

          {/* Metadata */}
          <dl
            className="
              divide-y divide-zinc-200 rounded-xl border border-zinc-200/80 bg-white px-4 shadow-xs transition-colors
              dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/50 dark:shadow-none
            "
          >
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                {t("name")}
              </dt>

              <dd className="truncate text-right text-sm font-medium text-zinc-900 dark:text-zinc-200">
                {generatedKey.name}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                {t("expires")}
              </dt>

              <dd className="text-right text-sm font-medium text-zinc-900 dark:text-zinc-200">
                {generatedKey.expiresAt
                  ? new Date(
                      generatedKey.expiresAt
                    ).toLocaleString()
                  : t("never")}
              </dd>
            </div>
          </dl>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setGeneratedKey(null);
                setCopied(false);
                setError(null);
              }}
              className="
                flex-1 rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200
                dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700
              "
            >
              {t("createAnother")}
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="
                flex-1 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-500 active:bg-violet-700
                dark:bg-violet-600 dark:hover:bg-violet-500
              "
            >
              {t("done")}
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  // ============================================================
  // Create form
  // ============================================================

  return (
    <PageShell
      title={t("title")}
      subtitle={t("subtitle")}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleCreate} className="space-y-7">
        {/* Form Container */}
        <div
          className="
            relative
            overflow-hidden
            space-y-6
            rounded-2xl
            border border-zinc-200/80 bg-white p-5 shadow-xs transition-colors
            dark:border-zinc-800 dark:bg-zinc-900/50 dark:shadow-none
            sm:p-6
          "
        >
          {/* Futuristic top glow */}
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

          <Field
            label={t("nameLabel")}
            help={t("nameHelp")}
            required
          >
            {({ id, ...aria }) => (
              <Input
                id={id}
                type="text"
                required
                autoComplete="off"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
                {...aria}
              />
            )}
          </Field>

          <Field
            label={t("expiresLabel")}
            help={t("expiresHelp")}
          >
            {({ id, ...aria }) => (
              <NumberInput
                id={id}
                min={0}
                value={expiresInDays}
                onValueChange={setExpiresInDays}
                {...aria}
              />
            )}
          </Field>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="
              flex items-start gap-3
              rounded-xl
              border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
              dark:border-rose-500/30 dark:bg-rose-950/20 dark:text-rose-400
              shadow-xs
            "
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="mt-0.5 h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                strokeLinecap="round"
                d="M12 8v4m0 4h.01"
              />
            </svg>

            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isLoading}
            className="
              flex-1 rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200
              dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {t("cancel")}
          </button>

          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="
              flex-1 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-500 active:bg-violet-700
              dark:bg-violet-600 dark:hover:bg-violet-500
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {isLoading ? (
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
        </div>
      </form>
    </PageShell>
  );
}