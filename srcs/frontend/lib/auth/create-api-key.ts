// src/lib/api-keys/createApiKey.ts
import type { useTranslations } from "next-intl";
import { toast } from "sonner";

import { authClient } from "@/lib/auth/auth-client";

type T = ReturnType<typeof useTranslations<"Settings.apiKeys">>;

export const createApiKey = async (t: T, name: string, expiresInDays: number) => {
  try {
    const days = Math.max(0, Math.floor(expiresInDays));

    const { data: key, error } = await authClient.apiKey.create({
      name,
      expiresIn: days > 0 ? days * 24 * 60 * 60 : undefined,
      metadata: { environment: process.env.NODE_ENV ?? "development" },
    });

    if (error) {
      toast.error(error.message ?? t("errorFailed"));
      return;
    }

    toast.success(t("createdTitle"), {
      description: key.key,
      duration: 60_000,
    });

    return key;
  } catch {
    toast.error(t("errorUnexpected"));
  }
};