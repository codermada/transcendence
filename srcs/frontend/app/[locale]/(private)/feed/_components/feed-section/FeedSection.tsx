"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { postService } from "../../_services/PostService";
import { CreatePostCard } from "./CreatePostCard";
import { PostCard } from "./PostCard";
import type { FeedSectionProps, Post } from "./feed-section.types";

export function FeedSection({ posts: initialPosts = [] }: FeedSectionProps) {
  const t = useTranslations("Feed.feed-section.FeedSection");

  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [hasMore, setHasMore] = useState<boolean>(initialPosts.length >= 10);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  const [prevInitialPosts, setPrevInitialPosts] = useState<Post[]>(initialPosts);
  if (prevInitialPosts !== initialPosts) {
    setPrevInitialPosts(initialPosts);
    setPosts(initialPosts);
    setHasMore(initialPosts.length >= 10);
    setPage(1);
  }

  const sectionRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const fetchMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const newPosts = await postService.getAllPosts({ page: nextPage });

      if (!newPosts || newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
        setPage(nextPage);

        if (newPosts.length < 10) {
          setHasMore(false);
        }
      }
    } catch {
      toast.error(t("loadMoreError") || "Erreur lors du chargement des publications");
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, isLoadingMore, hasMore, t]);

  useEffect(() => {
    const target = observerRef.current;
    const container = sectionRef.current;
    if (!target || !container || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMorePosts();
        }
      },
      {
        root: container,
        rootMargin: "200px 0px",
        threshold: 0.1,
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [fetchMorePosts, hasMore]);

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleUpdatePost = async (
    postId: string,
    data: { content: string; keptMediaUrls: string[]; newFiles: File[] }
  ) => {
    const updatedPost = await postService.updatePost(postId, data);
    setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await postService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success(t("deleteSuccess"));
    } catch {
      toast.error(t("deleteError"));
    }
  };

  return (
    <section
      ref={sectionRef}
      className="custom-scrollbar pb-15 h-full min-h-0 space-y-6 overflow-y-auto pr-2 lg:col-span-6"
    >
      <CreatePostCard onPostCreated={handlePostCreated} />

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800/60 dark:text-zinc-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h.01M12 12h.01M12 16.5h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {t("emptyTitle")}
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {t("emptyDescription")}
          </p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              postId={post.id}
              author={post.author}
              initials={post.initials}
              createdAt={post.createdAt}
              content={post.content}
              likesCount={post.likesCount}
              commentsCount={post.commentsCount}
              mediaUrls={post.mediaUrls}
              isOwner={post.isOwner}
              isLiked={post.isLiked}
              onUpdatePost={handleUpdatePost}
              onDeletePost={handleDeletePost}
            />
          ))}

          <div ref={observerRef} className="flex flex-col items-center justify-center py-6">
            {isLoadingMore && (
              <div className="flex items-center space-x-2">
                <svg
                  className="h-5 w-5 animate-spin text-zinc-500 dark:text-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t("loadingMore") || "Chargement..."}
                </span>
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {t("noMorePosts") || "Toutes les publications ont été chargées."}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}