"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { ProfileHeader } from "./_components/profile-header/ProfileHeader";
import { profileServices } from "./_services/ProfileServices";

import type { ProfileHeaderUser } from "./_components/profile-header/profile-header.types";

import { PostCard } from "@/app/[locale]/(private)/feed/_components/feed-section/PostCard";
import type { Post } from "@/app/[locale]/(private)/feed/_components/feed-section/feed-section.types";

import { postService } from "@/app/[locale]/(private)/feed/_services/PostService";

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations("ProfilePage");

  const [id, setId] = useState<string | null>(null);

  const [userProfile, setUserProfile] =
    useState<ProfileHeaderUser | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);

  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    params
      .then(({ id }) => {
        if (!mounted) return;

        setId(id);
      })
      .catch(() => {
        if (!mounted) return;

        setId(null);
        setUserProfile(null);
        setPosts([]);
        setIsProfileLoading(false);
        setIsPostsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [params]);

  useEffect(() => {
    if (!id) {
      setUserProfile(null);
      setIsProfileLoading(false);
      return;
    }

    let mounted = true;

    async function fetchUserProfile() {
      setIsProfileLoading(true);

      try {
        const profile = await profileServices.getUserProfileById(id);

        if (!mounted) return;

        setUserProfile(profile);
      } catch {
        if (!mounted) return;

        setUserProfile(null);
        toast.error(t("loadProfileError"));
      } finally {
        if (mounted) {
          setIsProfileLoading(false);
        }
      }
    }

    fetchUserProfile();

    return () => {
      mounted = false;
    };
  }, [id, t]);

  useEffect(() => {
    if (!id) {
      setPosts([]);
      setIsPostsLoading(false);
      return;
    }

    let mounted = true;

    async function fetchPosts() {
      setIsPostsLoading(true);

      try {
        const fetchedPosts =
          await profileServices.getAssociatedUserIdPosts(id);

        if (!mounted) return;

        setPosts(fetchedPosts);
      } catch {
        if (!mounted) return;

        setPosts([]);
        toast.error(t("toasts.loadPostsError"));
      } finally {
        if (mounted) {
          setIsPostsLoading(false);
        }
      }
    }

    fetchPosts();

    return () => {
      mounted = false;
    };
  }, [id, t]);

  const handleUpdatePost = async (
    postId: string,
    data: {
      content: string;
      keptMediaUrls: string[];
      newFiles: File[];
    }
  ) => {
    try {
      const updatedPost = await postService.updatePost(postId, data);

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? updatedPost : post
        )
      );
    } catch {
      toast.error(t("updateError"));
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await postService.deletePost(postId);

      setPosts((prev) =>
        prev.filter((post) => post.id !== postId)
      );

      toast.success(t("deleteSuccess"));
    } catch {
      toast.error(t("deleteError"));
    }
  };

  return (
    <main className="min-h-dvh w-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-white">
      <div
        className="
          mx-auto
          w-full
          max-w-6xl
          px-3
          py-4
          sm:px-5
          sm:py-6
          md:px-6
          lg:px-8
          lg:py-8
        "
      >
        {isProfileLoading ? (
          <ProfileSkeleton />
        ) : userProfile ? (
          <div className="w-full">
            <ProfileHeader user={userProfile} />
            <section
              className="
                mt-5
                w-full
                sm:mt-6
                lg:mt-8
              "
            >
              {isPostsLoading ? (
                <PostsSkeleton />
              ) : posts.length === 0 ? (
                <EmptyPosts />
              ) : (
                <div
                  className="
                    mx-auto
                    w-full
                    max-w-3xl
                    space-y-4
                    sm:space-y-5
                    lg:space-y-6
                  "
                >
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
                </div>
              )}
            </section>
          </div>
        ) : (
          <ProfileNotFound />
        )}
      </div>
    </main>
  );
}

function ProfileSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div
        className="
          h-28
          w-full
          rounded-xl
          bg-zinc-200
          sm:h-40
          sm:rounded-2xl
          md:h-48
          dark:bg-zinc-800
        "
      />

      <div
        className="
          relative
          -mt-10
          px-3
          sm:-mt-14
          sm:px-5
          md:-mt-16
          md:px-6
        "
      >
        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-end
          "
        >
          <div
            className="
              h-20
              w-20
              shrink-0
              rounded-full
              border-4
              border-zinc-50
              bg-zinc-200
              sm:h-28
              sm:w-28
              md:h-32
              md:w-32
              dark:border-zinc-950
              dark:bg-zinc-800
            "
          />

          <div
            className="
              flex
              flex-1
              flex-col
              gap-2
              pb-1
            "
          >
            <div className="h-6 w-40 rounded bg-zinc-200 sm:w-48 dark:bg-zinc-800" />
            <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PostsSkeleton() {
  return (
    <div
      className="
        mx-auto
        w-full
        max-w-3xl
        animate-pulse
        space-y-4
        sm:space-y-5
      "
    >
      {[1, 2].map((item) => (
        <div
          key={item}
          className="
            overflow-hidden
            rounded-xl
            border
            border-zinc-200
            bg-white
            p-4
            sm:rounded-2xl
            sm:p-5
            dark:border-zinc-800
            dark:bg-zinc-900
          "
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />

            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-4/5 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-3/5 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <div className="mt-4 h-48 w-full rounded-xl bg-zinc-200 sm:h-64 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}

function EmptyPosts() {
  const t = useTranslations("ProfilePage");

  return (
    <div
      className="
        mx-auto
        flex
        w-full
        max-w-3xl
        flex-col
        items-center
        justify-center
        rounded-xl
        border
        border-dashed
        border-zinc-300
        px-5
        py-10
        text-center
        sm:rounded-2xl
        sm:px-8
        sm:py-12
        dark:border-zinc-800
      "
    >
      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          bg-zinc-100
          text-zinc-400
          dark:bg-zinc-800/60
          dark:text-zinc-500
        "
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 7.5h.01M12 12h.01M12 16.5h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {t("emptyTitle")}
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-zinc-500 dark:text-zinc-400">
        {t("emptyDescription")}
      </p>
    </div>
  );
}

function ProfileNotFound() {
  const t = useTranslations("ProfilePage");

  return (
    <div className="flex min-h-[40vh] w-full items-center justify-center px-4">
      <div className="text-center">
        <div
          className="
            mx-auto
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            bg-zinc-100
            text-zinc-400
            dark:bg-zinc-900
            dark:text-zinc-500
          "
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m0 3.75h.01M10.29 3.86l-7.5 13A1.5 1.5 0 004.09 19h15.82a1.5 1.5 0 001.3-2.25l-7.5-13a1.5 1.5 0 00-2.6 0z"
            />
          </svg>
        </div>

        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          {t("loadProfileError")}
        </p>
      </div>
    </div>
  );
}