"use client";

import { useTranslations } from "next-intl";
import type { Comment } from "../feed-section.types";
import { CommentItem } from "./CommentItem";
import { convertTime } from "./utility/convertTime";

interface CommentsListProps {
  comments: Comment[];
  isLoading: boolean;
  likingCommentId: string | null;
  onToggleLike: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
}

export function CommentsList({
  comments,
  isLoading,
  likingCommentId,
  onToggleLike,
  onDelete,
}: CommentsListProps) {
  const t = useTranslations("Feed.feed-section.CommentsList");

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-zinc-500">{t("loading")}</div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="mb-2 text-3xl">💬</div>
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("emptyTitle")}
        </p>
        <p className="mt-1 text-xs text-zinc-500">{t("emptyDescription")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          isLiking={likingCommentId === comment.id}
          onToggleLike={onToggleLike}
          onDelete={onDelete}
          timeAgo={convertTime(comment.createdAt)}
        />
      ))}
    </div>
  );
}