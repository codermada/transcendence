"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";

type GeneratedKey = {
  id: string;
  name: string;
  key: string;
  expiresAt: Date | null;
};

export default function CreateApiKeyPage() {
  const router = useRouter();

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
        setError(error.message ?? "Failed to create API key");
        return;
      }

      if (!data) {
        setError("No key returned from server");
        return;
      }

      setGeneratedKey({
        id: data.id,
        name: data.name ?? name,
        key: data.key,
        expiresAt: data.expiresAt ?? null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
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
        <h1 className="text-2xl font-semibold">API Key Created</h1>
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          ⚠️ Copy this key now. You will <strong>not</strong> be able to see it again.
        </p>

        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between gap-4">
            <code className="break-all text-sm font-mono">{generatedKey.key}</code>
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Name</dt>
            <dd>{generatedKey.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Expires</dt>
            <dd>
              {generatedKey.expiresAt
                ? new Date(generatedKey.expiresAt).toLocaleString()
                : "Never"}
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex gap-3">
          <button
            onClick={() => router.push("/settings/api-keys")}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Done
          </button>
          <button
            onClick={() => {
              setGeneratedKey(null);
              setCopied(false);
            }}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Create another
          </button>
        </div>
      </div>
    );
  }

  // ---- Form screen ----
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Create API Key</h1>
      <p className="mt-2 text-sm text-gray-500">
        Generate a key to authenticate your apps against the API.
      </p>

      <form onSubmit={handleCreate} className="mt-8 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            placeholder="e.g. CI Pipeline"
          />
          <p className="mt-1 text-xs text-gray-500">
            A label to help you recognize this key later.
          </p>
        </div>

        <div>
          <label htmlFor="expiresInDays" className="block text-sm font-medium">
            Expires in (days)
          </label>
          <input
            id="expiresInDays"
            type="number"
            min={0}
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Set to <code>0</code> for a key that never expires.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {isLoading ? "Creating…" : "Create API Key"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}