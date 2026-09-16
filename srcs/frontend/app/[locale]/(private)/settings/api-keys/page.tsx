"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth/auth-client";

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
  const [generatedKey, setGeneratedKey] = useState<GeneratedKey | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await authClient.apiKey.create({
        name,
        expiresIn: expiresInDays > 0 ? expiresInDays * 24 * 60 * 60 : undefined,
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
        name: data.name ?? name,
        key: data.key,
        expiresAt: data.expiresAt ?? null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorUnexpected"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedKey) return;
    await navigator.clipboard.writeText(generatedKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ---- Reveal screen (shown after creation) ----
  if (generatedKey) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-semibold text-white">{t("createdTitle")}</h1>
        <p className="mt-2 text-sm text-red-400">
          {t("copyWarning")}
        </p>

        <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center justify-between gap-4">
            <code className="break-all text-sm font-mono text-white">{generatedKey.key}</code>
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-violet-500"
            >
              {copied ? t("copied") : t("copy")}
            </button>
          </div>
        </div>

        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-400">{t("name")}</dt>
            <dd className="text-zinc-200">{generatedKey.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-400">{t("expires")}</dt>
            <dd className="text-zinc-200">
              {generatedKey.expiresAt
                ? new Date(generatedKey.expiresAt).toLocaleString()
                : t("never")}
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex gap-3">
          <button
            onClick={() => router.push("/settings/api-keys")}
            className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
          >
            {t("done")}
          </button>
          <button
            onClick={() => {
              setGeneratedKey(null);
              setCopied(false);
            }}
            className="rounded-md border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            {t("createAnother")}
          </button>
        </div>
      </div>
    );
  }

  // ---- Form screen ----
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold text-white">{t("title")}</h1>
      <p className="mt-2 text-sm text-zinc-400">
        {t("subtitle")}
      </p>

      <form onSubmit={handleCreate} className="mt-8 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-300">
            {t("nameLabel")}
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
            placeholder={t("namePlaceholder")}
          />
          <p className="mt-1 text-xs text-zinc-500">
            {t("nameHelp")}
          </p>
        </div>

        <div>
          <label htmlFor="expiresInDays" className="block text-sm font-medium text-zinc-300">
            {t("expiresLabel")}
          </label>
          <input
            id="expiresInDays"
            type="number"
            min={0}
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-zinc-500">
            {t("expiresHelp")}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            {isLoading ? t("submitting") : t("submit")}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            {t("cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
