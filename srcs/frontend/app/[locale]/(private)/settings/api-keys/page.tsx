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
              border border-brand-500/20
              bg-brand-500/[0.04]
              p-5
            "
          >
            <div
              aria-hidden
              className="
                pointer-events-none
                absolute inset-0
                bg-ambient
                opacity-40
              "
            />

            <div className="relative flex items-start gap-4">
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
                <p className="text-sm font-semibold text-foreground">
                  {t("createdTitle")}
                </p>

                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {t("copyWarning")}
                </p>
              </div>
            </div>
          </div>

          {/* API key */}
          <section className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                API Key
              </span>

              <span className="text-[10px] font-medium uppercase tracking-wider text-brand-400">
                Secret
              </span>
            </div>

            <div
              className="
                relative overflow-hidden
                rounded-xl
                border border-border
                bg-background
                p-3
                transition-colors
                hover:border-border-hover
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
                  via-brand-500/60
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
                    text-subtle
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
                    border border-brand-500/30
                    bg-brand-500/10
                    px-3 py-2
                    text-xs font-semibold
                    text-brand-400
                    transition-all
                    hover:border-brand-500/50
                    hover:bg-brand-500/15
                    hover:text-brand-300
                    focus:outline-none
                    focus:ring-2
                    focus:ring-brand-500/20
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
              divide-y
              divide-border
              rounded-xl
              border border-border
              bg-surface/60
              px-4
            "
          >
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-xs text-muted">
                {t("name")}
              </dt>

              <dd className="truncate text-right text-sm text-subtle">
                {generatedKey.name}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-xs text-muted">
                {t("expires")}
              </dt>

              <dd className="text-right text-sm text-subtle">
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
              className="btn-secondary flex-1"
            >
              {t("createAnother")}
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="btn-primary flex-1"
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
        {/* Form */}
        <div
          className="
            relative
            overflow-hidden
            space-y-6
            rounded-2xl
            border border-border
            bg-surface/40
            p-5
            shadow-2xl
            shadow-black/20
            backdrop-blur-xl
            sm:p-6
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
              border border-danger/30
              bg-danger/10
              px-4 py-3
              text-sm text-danger
              shadow-[0_0_20px_rgb(239_68_68_/_0.06)]
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
              btn-secondary
              flex-1
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {t("cancel")}
          </button>

          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="
              btn-primary
              flex-1
              disabled:cursor-not-allowed
              disabled:opacity-50
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
