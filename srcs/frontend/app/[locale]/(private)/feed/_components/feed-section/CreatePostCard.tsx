"use client";

import { Send } from "@/components/icons";
import { UploadProgressToast } from "@/components/util/UploadProgressToast";
import { useTranslations } from "next-intl";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { profileService, UserProfileResponse } from "../../_services/feed/profile/ProfileService";
import { postService } from "../../_services/PostService";
import type { MediaPreview, Post } from "./feed-section.types";

interface CreatePostCardProps {
  onPostCreated?: (newPost: Post) => void;
}

const BACKEND_ERROR_MAP: Record<string, string> = {
  "Le contenu ne peut pas être vide": "errors.CONTENT_EMPTY",
};

export function CreatePostCard({ onPostCreated }: CreatePostCardProps) {
  const t = useTranslations("Feed.feed-section.CreatePostCard");

  const [content, setContent] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfileResponse>({
    name: "Unknown",
    username: "unknown",
    initials: "U",
    image: null,
    stats: {
      friendsCount: 0,
      postsCount: 0,
      reactionsCount: 0,
    },
  });
  const [selectedMedia, setSelectedMedia] = useState<MediaPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchUserProfile() {
      try {
        const fetchedUserProfile = await profileService.getUserProfile();

        if (isMounted) {
          setUserProfile(fetchedUserProfile);
        }
      } catch (error) {
        console.error("Error loading user profile :", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const translateBackendError = (rawMessage?: string): string => {
    if (!rawMessage) return t("errors.DEFAULT");

    const key = BACKEND_ERROR_MAP[rawMessage];
    if (key) return t(key);

    if (t.has(rawMessage)) return t(rawMessage);

    return rawMessage;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newMedia: MediaPreview[] = Array.from(files).map((file) => {
      const isVideo = file.type.startsWith("video/");
      const rawUrl = URL.createObjectURL(file);

      return {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        url: isVideo ? `${rawUrl}#t=0.001` : rawUrl,
        type: isVideo ? "video" : "image",
      };
    });

    setSelectedMedia((prev) => [...prev, ...newMedia]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveMedia = (idToRemove: string) => {
    setSelectedMedia((prev) => {
      const itemToRemove = prev.find((item) => item.id !== idToRemove);
      if (itemToRemove) {
        const cleanUrl = itemToRemove.url.split("#")[0];
        URL.revokeObjectURL(cleanUrl);
      }
      return prev.filter((item) => item.id !== idToRemove);
    });
  };

  const handleSubmit = async () => {
    if (!content.trim() && selectedMedia.length === 0) return;

    setIsLoading(true);

    const hasFiles = selectedMedia.length > 0;
    let toastId: string | number | undefined;

    if (hasFiles) {
      toastId = toast.custom(
        () => (
          <UploadProgressToast
            progress={0}
            fileName={`${selectedMedia.length}${selectedMedia.length !== 1 ? t("multiFile") : t("singleFile")}`}
          />
        ),
        { duration: Infinity }
      );
    }

    try {
      const files = selectedMedia.map((m) => m.file);

      const createdPost = await postService.createPost(
        { content, files },
        (progress) => {
          if (hasFiles && toastId) {
            toast.custom(
              () => (
                <UploadProgressToast
                  progress={progress}
                  fileName={`${selectedMedia.length}${selectedMedia.length !== 1 ? t("multiFile") : t("singleFile")}`}
                  isCompleted={progress >= 100}
                />
              ),
              { id: toastId, duration: Infinity }
            );
          }
        }
      );

      if (toastId) {
        toast.dismiss(toastId);
      }
      toast.success(t("postCreatedSuccess") || "Publication publiée avec succès !");

      selectedMedia.forEach((m) => {
        const cleanUrl = m.url.split("#")[0];
        URL.revokeObjectURL(cleanUrl);
      });
      setSelectedMedia([]);
      setContent("");

      if (onPostCreated) {
        onPostCreated(createdPost);
      }
    } catch (err: any) {
      if (toastId) {
        toast.dismiss(toastId);
      }

      const translatedMessage = translateBackendError(err?.message);

      toast.error(translatedMessage, {
        style: {
          backgroundColor: "#a60000d1",
          color: "#fec2c2",
          borderColor: "#00000000",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="shadow-2xs rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900/50">
      <div className="flex gap-3">
        <img
          src={userProfile.image ?? "/nest/uploads/default-avatar.png"}
          alt=""
          className="h-10 w-10 rounded-full object-cover"
        />
        <textarea
          rows={2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading}
          placeholder={t("placeholder")}
          className="w-full resize-none bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none disabled:opacity-50 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
      </div>

      {selectedMedia.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {selectedMedia.map((media) => (
            <div
              key={media.id}
              className="group relative aspect-video overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800"
            >
              {media.type === "image" ? (
                <img
                  src={media.url}
                  alt={media.file.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <video
                  src={media.url}
                  className="h-full w-full object-cover"
                  controls={false}
                  muted
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={(e) => {
                    e.currentTarget.currentTime = 0.001;
                  }}
                />
              )}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleRemoveMedia(media.id)}
                className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-opacity hover:bg-black/80 disabled:opacity-50"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*"
        multiple
        className="hidden"
      />

      <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 text-xs font-medium text-zinc-500 transition-colors hover:text-violet-600 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-violet-400"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          <span>
            {selectedMedia.length > 0
              ? `${t("pluralMedia")} (${selectedMedia.length})`
              : `${t("singularMedia")}`}
          </span>
        </button>

        <button
          type="button"
          disabled={isLoading || (!content.trim() && selectedMedia.length === 0)}
          onClick={handleSubmit}
          className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50 active:scale-95"
        >
          <span>{isLoading ? t("isLoading") : t("publish")}</span>
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}