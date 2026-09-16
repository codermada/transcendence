"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

export default function ProfileSettingsPage() {
  const t = useTranslations("Settings.profile");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: wire up to auth client
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
      </header>

      {/* Profile form */}
      <form
        onSubmit={handleSubmit}
        className="
          relative overflow-hidden
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

        <Field label={t("nameLabel")} help={t("nameHelp")}>
          {({ id, ...aria }) => (
            <Input
              id={id}
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              {...aria}
            />
          )}
        </Field>

        <Field label={t("emailLabel")} help={t("emailHelp")}>
          {({ id, ...aria }) => (
            <Input
              id={id}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              {...aria}
            />
          )}
        </Field>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? t("submitting") : t("submit")}
          </button>
        </div>
      </form>
    </div>
  );
}