"use client";

import { useEffect, useRef, useState } from "react";
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

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // keep in sync with backend
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

// ============================================================
// Page
// ============================================================

export default function ProfileSettingsPage() {
  const t = useTranslations("Settings.profile");
  const ta = useTranslations("Profile");
  const tv = useTranslations("Auth.validation");

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          toast.error(ta("errorUnexpected"));
          return;
        }

        const user: CurrentUser = await res.json();

        setEmail(user.email ?? "");
        setImage(user.image);
        reset({ name: user.name ?? "" });
      } catch {
        if (!cancelled) toast.error(ta("errorUnexpected"));
      } finally {
        if (!cancelled) setIsSessionLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reset, ta]);

  // ============================================================
  // Avatar upload
  // ============================================================

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(ta("errorAvatarType"));
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error(ta("errorAvatarSize"));
      return;
    }

    setIsUploading(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/nest/user/me/avatar", {
        method: "PATCH",
        credentials: "include",
        body: form,
      });

      if (res.status === 413) {
        toast.error(ta("errorAvatarSize"));
        return;
      }
      if (!res.ok) {
        toast.error(ta("errorAvatarUpload"));
        return;
      }

      const updated: CurrentUser = await res.json();
      setImage(updated.image ? `${updated.image}?v=${Date.now()}` : null);
      toast.success(ta("avatarUpdated"));
    } catch {
      toast.error(ta("errorAvatarUpload"));
    } finally {
      setIsUploading(false);
    }
  }

  // ============================================================
  // Avatar delete
  // ============================================================

  async function handleAvatarDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch("/nest/user/me/avatar", {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        toast.error(ta("errorAvatarRemove"));
        return;
      }

      const updated: CurrentUser = await res.json();
      setImage(updated.image);
      toast.success(ta("avatarRemoved"));
    } catch {
      toast.error(ta("errorAvatarRemove"));
    } finally {
      setIsDeleting(false);
    }
  }

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
        err instanceof Error ? err.message : ta("errorUnexpected"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // Render
  // ============================================================

  const displayName = ta("unnamed");
  const initials = getInitials(displayName);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
      </header>

      <div
        className="
          relative overflow-hidden
          space-y-6
          rounded-2xl
          border border-zinc-200/80 bg-white p-5 shadow-xs transition-colors
          dark:border-zinc-800 dark:bg-zinc-900/50 dark:shadow-none
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
            via-violet-500/50
            to-transparent
            shadow-[0_0_14px_rgb(139_92_246_/_0.35)]
          "
        />

        {/* ───────── Avatar ───────── */}
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isDeleting || isSessionLoading}
            className="group relative shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-wait"
            aria-label={ta("changeAvatar")}
          >
            <Avatar src={image} initials={initials} alt={displayName} />

            <span
              className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/55 text-xs font-medium text-white transition-opacity ${
                isUploading
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              }`}
            >
              {isUploading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                ta("changeAvatar")
              )}
            </span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={handleAvatarChange}
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isDeleting || isSessionLoading}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? ta("uploadingAvatar") : ta("changeAvatar")}
            </button>

            {image && (
              <button
                type="button"
                onClick={handleAvatarDelete}
                disabled={isUploading || isDeleting || isSessionLoading}
                className="text-sm font-medium text-danger underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? ta("removingAvatar") : ta("removeAvatar")}
              </button>
            )}
          </div>
        </div>

        {/* ───────── Profile form ───────── */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-6 border-t border-border pt-6"
        >
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
              className="
              rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-500 active:bg-violet-700
              dark:bg-violet-600 dark:hover:bg-violet-500
              disabled:cursor-not-allowed disabled:opacity-50
            "
            >
              {isLoading ? t("submitting") : t("submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function Avatar({
  src,
  initials,
  alt,
}: {
  src: string | null;
  initials: string;
  alt: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className="h-20 w-20 shrink-0 rounded-full object-cover ring-1 ring-border"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-600/15 text-lg font-semibold text-brand-400 ring-1 ring-border">
      {initials}
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}