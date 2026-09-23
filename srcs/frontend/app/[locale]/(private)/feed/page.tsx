"use client";

import { useEffect, useState } from "react";
import { Post } from "./_components/feed-section/feed-section.types";
import { FeedSection } from "./_components/feed-section/FeedSection";
import { NetworkSidebar } from "./_components/network-sidebar/NetworkSidebar";
import { ProfileSidebar } from "./_components/profile-sidebar/ProfileSidebar";
import { postService } from "./_services/PostService";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const currentUser = {
    name: "Alex User",
    username: "alex_hb",
    initials: "HB",
    stats: {
      friendsCount: 0,
      postsCount: 0,
      reactionsCount: 0,
    },
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchPosts() {
      try {
        const fetchedPosts = await postService.getAllPosts();
        
        if (isMounted) {
          setPosts(fetchedPosts);
        }
      } catch (error) {
        console.error("Erreur de chargement des posts :", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const networkData = {
    receivedRequests: [],
    sentRequests: [],
    suggestions: [],
  };

  return (
    <main className="h-dvh w-full overflow-hidden bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto flex h-dvh max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid h-full min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-12">
          <ProfileSidebar user={currentUser} />
          
          {isLoading ? (
            <div className="col-span-1 flex items-center justify-center lg:col-span-6">
              <p className="animate-pulse text-zinc-500">Chargement du fil d'actualité...</p>
            </div>
          ) : (
            <FeedSection posts={posts} />
          )}

          <NetworkSidebar
            receivedRequests={networkData.receivedRequests}
            sentRequests={networkData.sentRequests}
            suggestions={networkData.suggestions}
          />
        </div>
      </div>
    </main>
  );
}