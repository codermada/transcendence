"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Close, Loader, Settings, Upload } from "@/components/icons";
import type { ChannelDetail } from "@/stores/use-channel-store";
import { updateChannel } from "../../_services/channel-service";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];

interface ChannelSettingsModalProps {
  channel: ChannelDetail;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (updatedChannel: ChannelDetail) => void;
}

export function ChannelSettingsModal({
  channel,
  isOpen,
  onClose,
  onUpdated,
}: ChannelSettingsModalProps) {
  const t = useTranslations("Channels");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmittingInternal, setIsSubmittingInternal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateChannelSchema = z.object({
    title: z
      .string()
      .trim()
      .min(1, { message: t("titleMinError") })
      .max(100, { message: t("titleMaxError") }),
    description: z
      .string()
      .max(200, { message: t("descMaxError") })
      .optional()
      .or(z.literal("")),
  });

  type UpdateChannelFormValues = z.infer<typeof updateChannelSchema>;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateChannelFormValues>({
    resolver: zodResolver(updateChannelSchema),
    defaultValues: {
      title: channel.title || "",
      description: channel.description || "",
    },
  });

  const watchedTitle = watch("title") || "";
  const watchedDescription = watch("description") || "";

  useEffect(() => {
    if (isOpen) {
      reset({
        title: channel.title || "",
        description: channel.description || "",
      });
      setSelectedFile(null);
      setPreviewUrl(channel.mediaUrl || null);
      setFileError(null);
    }
  }, [isOpen, channel, reset]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      const err = t("errorAvatarType");
      setFileError(err);
      toast.error(err);
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      const err = t("errorAvatarSize");
      setFileError(err);
      toast.error(err);
      return;
    }

    setFileError(null);
    setSelectedFile(file);

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
  };

  const handleRemoveNewFile = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(channel.mediaUrl || null);
    setFileError(null);
  };

  const onSubmit = async (values: UpdateChannelFormValues) => {
    setIsSubmittingInternal(true);
    setFileError(null);

    try {
      const updatedChannel = await updateChannel(channel.id, {
        title: values.title.trim(),
        description: values.description ? values.description.trim() : "",
        file: selectedFile,
      });

      toast.success(t("success.channelUpdated"));
      onUpdated?.(updatedChannel);
      onClose();
    } catch (err: unknown) {
      const message =
        (err as Error).message || t("error.updatingChannel");
      toast.error(message);
    } finally {
      setIsSubmittingInternal(false);
    }
  };

  const channelInitials = channel.title
    ? channel.title.trim().charAt(0).toUpperCase()
    : "#";

  const submitting = isSubmitting || isSubmittingInternal;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                {t("editChannelTitle")}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {channel.title} • {t("membersCount", { count: channel.members?.length || 0 })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
          >
            <Close className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 flex flex-1 flex-col overflow-y-auto space-y-4 pr-1"
        >
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {t("avatarLabel")}
            </label>
            <div className="mt-2 flex items-center gap-4 rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting}
                className="group relative h-16 w-16 shrink-0 rounded-2xl overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950 disabled:cursor-wait cursor-pointer ring-1 ring-zinc-200/80 dark:ring-zinc-800"
                aria-label={t("changeAvatar")}
              >
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt={channel.title}
                    className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-violet-100 text-lg font-bold text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
                    {channelInitials}
                  </div>
                )}

                <span
                  className={`absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-[10px] font-medium text-white transition-opacity ${
                    submitting ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {submitting ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mb-0.5" />
                      <span>{t("changeAvatar")}</span>
                    </>
                  )}
                </span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  {selectedFile ? selectedFile.name : channel.title}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {selectedFile
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo`
                    : t("avatarHint")}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting}
                    className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-50"
                  >
                    {t("changeAvatar")}
                  </button>

                  {selectedFile && (
                    <button
                      type="button"
                      onClick={handleRemoveNewFile}
                      disabled={submitting}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer disabled:opacity-50"
                    >
                      {t("removeNewAvatar")}
                    </button>
                  )}
                </div>
              </div>
            </div>
            {fileError && (
              <p className="mt-1 text-xs text-rose-500">{fileError}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {t("nameLabel")}
              </label>
              <span className="text-[11px] text-zinc-400">
                {watchedTitle.length}/100
              </span>
            </div>
            <input
              type="text"
              maxLength={100}
              placeholder={t("namePlaceholder")}
              disabled={submitting}
              {...register("title")}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-violet-400 dark:focus:bg-zinc-900 disabled:opacity-50"
            />
            {errors.title?.message && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {t("descLabel")}
              </label>
              <span className="text-[11px] text-zinc-400">
                {watchedDescription.length}/200
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={200}
              placeholder={t("descPlaceholder")}
              disabled={submitting}
              {...register("description")}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-violet-400 dark:focus:bg-zinc-900 disabled:opacity-50 resize-none"
            />
            {errors.description?.message && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting || !watchedTitle.trim()}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-xs font-semibold text-white shadow-sm shadow-violet-500/20 transition hover:bg-violet-500 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader className="h-3.5 w-3.5 animate-spin" />
                  <span>{t("savingChanges")}</span>
                </>
              ) : (
                <span>{t("saveChanges")}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
