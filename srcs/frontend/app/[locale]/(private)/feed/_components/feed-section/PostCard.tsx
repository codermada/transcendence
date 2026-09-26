"use client";

import { useTranslations } from "next-intl";
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { PostActions } from "./PostActions";
import { PostHeader } from "./PostHeader";
import { PostMedia } from "./PostMedia";
import type { PostCardProps } from "./feed-section.types";

interface ExtendedPostCardProps extends PostCardProps {
  postId: string;
  authorId: string;
  authorImage?: string | null;
  isOwner?: boolean;
  isLiked?: boolean;
  children?: ReactNode;
  onUpdatePost?: (
    postId: string,
    data: {
      content: string;
      keptMediaUrls: string[];
      newFiles: File[];
    }
  ) => Promise<void>;
  onDeletePost?: (postId: string) => Promise<void>;
  onAdminDeletePost?: (postId: string) => Promise<void>;
  onToggleLike?: (postId: string) => Promise<void>;
}

const isVideoMedia = (source: string | File): boolean => {
  if (source instanceof File) {
    return source.type.startsWith("video/");
  }
  const cleanUrl = source.split("?")[0].toLowerCase();
  return (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".ogg") ||
    cleanUrl.endsWith(".mov")
  );
};

export function PostCard({
  postId,
  authorId,
  author,
  initials,
  authorImage,
  createdAt,
  content,
  likesCount,
  commentsCount,
  mediaUrls = [],
  isOwner = false,
  isLiked = false,
  onUpdatePost,
  onDeletePost,
  onAdminDeletePost,
  onToggleLike,
  children,
}: ExtendedPostCardProps) {
  const t = useTranslations("Feed.feed-section.PostCard");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content || "");
  const [keptMediaUrls, setKeptMediaUrls] = useState<string[]>(mediaUrls);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartEdit = () => {
    setEditedContent(content || "");
    setKeptMediaUrls(mediaUrls);
    setNewFiles([]);
    setNewFilePreviews([]);
    setIsEditing(true);
  };

  const handleCancel = () => {
    newFilePreviews.forEach((previewUrl) => {
      const cleanUrl = previewUrl.split("#")[0];
      URL.revokeObjectURL(cleanUrl);
    });
    setEditedContent(content || "");
    setKeptMediaUrls(mediaUrls);
    setNewFiles([]);
    setNewFilePreviews([]);
    setIsEditing(false);
  };

  const handleRemoveExistingMedia = (urlToRemove: string) => {
    setKeptMediaUrls((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const filesArray = Array.from(e.target.files);
    const totalCount = keptMediaUrls.length + newFiles.length + filesArray.length;

    if (totalCount > 10) {
      toast.error(t("maxFilesError"));
      return;
    }

    setNewFiles((prev) => [...prev, ...filesArray]);

    const newPreviews = filesArray.map((file) => {
      const rawUrl = URL.createObjectURL(file);
      return isVideoMedia(file) ? `${rawUrl}#t=0.001` : rawUrl;
    });

    setNewFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewFilePreviews((prev) => {
      const cleanUrl = prev[index].split("#")[0];
      URL.revokeObjectURL(cleanUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSave = async () => {
    if (!editedContent.trim() && keptMediaUrls.length === 0 && newFiles.length === 0) {
      toast.error(t("emptyPostError"));
      return;
    }

    setIsSubmitting(true);
    try {
      if (onUpdatePost) {
        await onUpdatePost(postId, {
          content: editedContent,
          keptMediaUrls,
          newFiles,
        });
      }
      newFilePreviews.forEach((previewUrl) => {
        const cleanUrl = previewUrl.split("#")[0];
        URL.revokeObjectURL(cleanUrl);
      });
      setIsEditing(false);
      toast.success(t("updateSuccess"));
    } catch {
      toast.error(t("updateError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="shadow-2xs space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/50">
      <PostHeader
        postId={postId}
        authorId={authorId}
        author={author}
        initials={initials}
        authorImage={authorImage}
        createdAt={createdAt}
        isOwner={isOwner}
        onEdit={handleStartEdit}
        onDelete={() => onDeletePost?.(postId)}
        onDeleted={() => onAdminDeletePost?.(postId)}
      />

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            rows={3}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            disabled={isSubmitting}
            placeholder={t("placeholder")}
            className="w-full resize-none rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              {t("mediaLabel")}
            </label>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {keptMediaUrls.map((url) => {
                const isVideo = isVideoMedia(url);
                const videoSrc = isVideo ? (url.includes("#") ? url : `${url}#t=0.001`) : url;

                return (
                  <div
                    key={url}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    {isVideo ? (
                      <video
                        src={videoSrc}
                        className="h-full w-full object-cover"
                        controls={false}
                        muted
                        playsInline
                        preload="metadata"
                        onLoadedMetadata={(e) => {
                          e.currentTarget.currentTime = 0.001;
                        }}
                      />
                    ) : (
                      <img
                        src={url}
                        alt="Media"
                        className="h-full w-full object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingMedia(url)}
                      className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}

              {newFilePreviews.map((previewUrl, index) => {
                const file = newFiles[index];
                const isVideo = file ? isVideoMedia(file) : false;
                return (
                  <div
                    key={previewUrl}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-violet-300 bg-zinc-100 dark:border-violet-700 dark:bg-zinc-800"
                  >
                    {isVideo ? (
                      <video
                        src={previewUrl}
                        className="h-full w-full object-cover"
                        controls={false}
                        muted
                        playsInline
                        preload="metadata"
                        onLoadedMetadata={(e) => {
                          e.currentTarget.currentTime = 0.001;
                        }}
                      />
                    ) : (
                      <img
                        src={previewUrl}
                        alt="New media preview"
                        className="h-full w-full object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveNewFile(index)}
                      className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}

              {keptMediaUrls.length + newFiles.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 text-zinc-500 hover:border-violet-500 hover:bg-violet-50/50 hover:text-violet-600 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:border-violet-500 dark:hover:bg-violet-950/20"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  <span className="mt-1 text-[10px] font-medium">{t("addMedia")}</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={handleAddFiles}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCancel}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSave}
              className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500 disabled:opacity-50"
            >
              {isSubmitting ? t("saving") : t("save")}
            </button>
          </div>
        </div>
      ) : (
        <>
          {content && (
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {content}
            </p>
          )}
          <PostMedia mediaUrls={mediaUrls} />
        </>
      )}

      {children}

      <PostActions
        postId={postId}
        likesCount={likesCount}
        commentsCount={commentsCount}
        isLiked={isLiked}
        onToggleLike={onToggleLike}
      />
    </article>
  );
}