"use client";

import { MoreVertical, Pencil, Trash2 } from "@/components/icons";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";
import { postService } from "../../_services/PostService";
import type { PostHeaderProps } from "./feed-section.types";

interface ExtendedPostHeaderProps extends PostHeaderProps {
  postId: string;
  authorId: string;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onDeleted?: () => void;
}

function formatTimeAgo(createdAt: string | Date): string {
  const seconds = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 1000
  );

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function PostHeader({
  postId,
  author,
  initials,
  authorId,
  authorImage,
  createdAt,
  isOwner = false,
  onEdit,
  onDelete,
  onDeleted,
}: ExtendedPostHeaderProps) {
  const t = useTranslations("Feed.feed-section.PostHeader");
  const { data: session } = authClient.useSession();

  const [timeAgo, setTimeAgo] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminConfirmOpen, setIsAdminConfirmOpen] = useState(false);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const adminConfirmRef = useRef<HTMLDivElement>(null);
  const profileHref = `/profile/${authorId}`;

  const role = session?.user?.role;
  const canModerate = role === "admin" || role === "moderator";

  useEffect(() => {
    if (!createdAt) return;
    setTimeAgo(formatTimeAgo(createdAt));
  }, [createdAt]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (
        adminConfirmRef.current &&
        !adminConfirmRef.current.contains(event.target as Node)
      ) {
        setIsAdminConfirmOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdminConfirm = async () => {
    setIsAdminSubmitting(true);
    try {
      await postService.adminDeletePost(postId);
      toast.success(t("adminDeleteSuccess"));
      setIsAdminConfirmOpen(false);
      onDeleted?.();
    } catch {
      toast.error(t("adminDeleteError"));
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link
          href={profileHref}
          className="shrink-0"
          aria-label={t("viewProfile", { name: author })}
          title={isOwner ? t("viewMyProfile") : t("viewProfile", { name: author })}
        >
          {authorImage ? (
            <img
              src={authorImage}
              alt={author}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <img
              src="/nest/uploads/default-avatar.png"
              alt={author}
              className="h-10 w-10 rounded-full object-cover"
            />
          )}
        </Link>
        <div>
          <Link
            href={profileHref}
            className="
              text-sm
              font-semibold
              text-zinc-900
              transition
              hover:underline
              dark:text-zinc-100"
            title={isOwner ? t("viewMyProfile") : t("viewProfile", { name: author })}
          >
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {author}
            </h4>
          </Link>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {timeAgo}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {canModerate && !isOwner && (
          <div className="relative" ref={adminConfirmRef}>
            <button
              type="button"
              onClick={() => setIsAdminConfirmOpen((prev) => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
              aria-label={t("adminDelete")}
              title={t("adminDelete")}
            >
              <Trash2 className="h-5 w-5" />
            </button>

            {isAdminConfirmOpen && (
              <div className="absolute right-0 top-9 z-10 w-44 overflow-hidden rounded-xl border border-zinc-200/80 bg-white p-2 shadow-lg dark:border-zinc-800/80 dark:bg-zinc-900">
                <p className="px-2 pb-2 text-xs text-zinc-600 dark:text-zinc-400">
                  {t("adminDeleteConfirm")}
                </p>
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    disabled={isAdminSubmitting}
                    onClick={() => setIsAdminConfirmOpen(false)}
                    className="rounded-md px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="button"
                    disabled={isAdminSubmitting}
                    onClick={handleAdminConfirm}
                    className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
                  >
                    {t("delete")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {isOwner && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              aria-label={t("options")}
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-9 z-10 w-36 overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-lg dark:border-zinc-800/80 dark:bg-zinc-900">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEdit?.();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Pencil className="h-4 w-4" />
                  {t("edit")}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete?.();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                  {t("delete")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}