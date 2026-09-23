"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { postLikeService } from "../../_services/PostLikeService";
import type { PostActionsProps } from "./feed-section.types";
import { CommentsModal } from "./comments-modal/CommentsModal";

export function PostActions({
  postId,
  likesCount: initialLikesCount,
  commentsCount,
  isLiked: initialIsLiked = false,
  onToggleLike,
}: PostActionsProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isPending, setIsPending] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);

  useEffect(() => {
    setLikesCount(initialLikesCount);
  }, [initialLikesCount]);

  const handleLikeClick = async () => {
    if (isPending) return;

    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;

    const nextIsLiked = !isLiked;
    const nextLikesCount = nextIsLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

    setIsLiked(nextIsLiked);
    setLikesCount(nextLikesCount);
    setIsPending(true);

    try {
      if (onToggleLike) {
        await onToggleLike(postId);
      } else {
        const res = await postLikeService.toggleLike(postId);
        setIsLiked(res.liked);
        setLikesCount(res.likesCount);
      }
    } catch (error) {
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
      toast.error("Impossible de mettre à jour la réaction.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
    <div className="flex items-center gap-6 border-t border-zinc-100 pt-3 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
      <button
        type="button"
        disabled={isPending}
        onClick={handleLikeClick}
        className={`flex items-center gap-1.5 text-xs transition-colors ${
          isLiked
            ? "font-semibold text-violet-600 dark:text-violet-400"
            : "hover:text-violet-600 dark:hover:text-violet-400"
        }`}
      >
        <svg
          className="h-4 w-4 transition-transform active:scale-125"
          fill={isLiked ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={isLiked ? 0 : 2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span>{likesCount}</span>
      </button>

      <button
        type="button"
        onClick={() => setIsCommentsOpen(true)}
        className="flex items-center gap-1.5 text-xs transition-colors hover:text-violet-600 dark:hover:text-violet-400"
        aria-haspopup="dialog"
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
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span>{commentsCount}</span>
      </button>
    </div>

    <CommentsModal
      postId={postId}
      open={isCommentsOpen}
      onOpenChange={setIsCommentsOpen}
    />

    </>
  );
}
