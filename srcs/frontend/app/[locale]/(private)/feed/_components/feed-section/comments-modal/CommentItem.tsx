"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { Comment } from "./feed-section.types";
import { useRole } from "@/hooks/useRole";

interface CommentItemProps {
  comment: Comment;
  isLiking: boolean;
  onToggleLike: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
  timeAgo: { time: string; value: number } | undefined;
}

export function CommentItem({
  comment,
  isLiking,
  onToggleLike,
  onDelete,
  timeAgo,
}: CommentItemProps) {
  const t = useTranslations("Feed.feed-section.CommentItem");
  const { isModerator } = useRole();

  const profileHref = `/profile/${comment.userId}`;

  // Author can delete their own; moderator/admin can delete any.
  const canDelete = comment.isCommentByCurrentUser || isModerator;

  // If a moderator is deleting someone else's comment, use a stronger label.
  const isModerating = isModerator && !comment.isCommentByCurrentUser;

  return (
    <article className="flex gap-3">
      <Link
        href={profileHref}
        className="shrink-0"
        aria-label={t("viewProfile", { name: comment.user.name })}
      >
        {comment.user.image ? (
          <img
            src={comment.user.image}
            alt={comment.user.name}
            className="
              h-9
              w-9
              rounded-full
              object-cover
              transition
              hover:opacity-80
            "
          />
        ) : (
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-violet-100
              text-sm
              font-semibold
              text-violet-600
              transition
              hover:opacity-80
              dark:bg-violet-950
              dark:text-violet-300
            "
          >
            {comment.user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              href={profileHref}
              className="
                text-sm
                font-semibold
                text-zinc-900
                transition
                hover:underline
                dark:text-zinc-100
              "
            >
              {comment.user.name}
            </Link>

            {timeAgo && (
              <p className="text-xs text-zinc-400">
                {t("timeAgo", { time: timeAgo.time })}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              disabled={isLiking}
              onClick={() => onToggleLike(comment)}
              aria-label={
                comment.isLikedByCurrentUser
                  ? t("unlikeComment")
                  : t("likeComment")
              }
              className={`flex items-center gap-1 text-xs transition ${
                comment.isLikedByCurrentUser
                  ? "text-red-500"
                  : "text-zinc-400 hover:text-red-500"
              }`}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill={comment.isLikedByCurrentUser ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
                />
              </svg>
              <span>{comment.likesCount}</span>
            </button>

            {canDelete && (
              <button
                type="button"
                onClick={() => onDelete(comment)}
                aria-label={
                  isModerating ? t("removeComment") : t("deleteComment")
                }
                className="
                  text-xs text-zinc-400 transition
                  hover:text-red-500
                  focus:outline-none focus-visible:text-red-500
                "
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 7h12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m-7 0v11a2 2 0 002 2h4a2 2 0 002-2V7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {comment.content && (
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            {comment.content}
          </p>
        )}

        {comment.mediaUrl && (
          <img
            src={comment.mediaUrl}
            alt={t("commentAttachment")}
            className="mt-3 max-h-64 max-w-full rounded-xl object-cover"
          />
        )}
      </div>
    </article>
  );
}