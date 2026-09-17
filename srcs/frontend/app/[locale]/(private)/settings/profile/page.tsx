"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

// ============================================================
// Schema — email is read-only, so only name is validated/submitted
// ============================================================

const profileSchema = z.object({
  name: z.string().trim().min(2, "nameMin").max(50, "nameMax"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type CurrentUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

// ============================================================
// Page
// ============================================================

export default function ProfileSettingsPage() {
  const t = useTranslations("Settings.profile");
  const tv = useTranslations("Auth.validation");

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
    },
  });

  // ============================================================
  // Populate from the database (via Nest)
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/nest/user/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (cancelled) return;

        if (!res.ok) {
          toast.error(t("errorUnexpected"));
          return;
        }

        const user: CurrentUser = await res.json();

        setEmail(user.email ?? "");
        reset({ name: user.name ?? "" });
      } catch {
        if (!cancelled) toast.error(t("errorUnexpected"));
      } finally {
        if (!cancelled) setIsSessionLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reset, t]);

  // ============================================================
  // Submit
  // ============================================================

  const onSubmit = async (values: ProfileFormValues) => {
    setIsLoading(true);

    try {
      const res = await fetch("/nest/user/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: values.name }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message =
          body?.message ?? `Request failed with status ${res.status}`;
        throw new Error(
          Array.isArray(message) ? message.join(", ") : message,
        );
      }

      toast.success(t("saved"));
      reset(values); // clear isDirty after successful save
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("errorUnexpected"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
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

        <Field
          label={t("nameLabel")}
          help={t("nameHelp")}
          error={errors.name ? tv(errors.name.message as string) : undefined}
        >
          {({ id, ...aria }) => (
            <Input
              id={id}
              type="text"
              autoComplete="name"
              placeholder={t("namePlaceholder")}
              disabled={isSessionLoading}
              {...aria}
              {...register("name")}
            />
          )}
        </Field>

        <Field label={t("emailLabel")} help={t("emailLocked")}>
          {({ id, ...aria }) => (
            <Input
              id={id}
              type="email"
              autoComplete="email"
              value={email}
              readOnly
              disabled
              aria-readonly="true"
              {...aria}
            />
          )}
        </Field>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || isSessionLoading || !isDirty}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? t("submitting") : t("submit")}
          </button>
        </div>
      </form>
    </div>
  );
}