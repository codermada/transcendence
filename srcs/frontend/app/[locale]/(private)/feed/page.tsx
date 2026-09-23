"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Post } from "./_components/feed-section/feed-section.types";
import { FeedSection } from "./_components/feed-section/FeedSection";
import {
  FriendSuggestion,
  ReceivedFriendRequest,
  SentFriendRequest,
} from "./_components/network-sidebar/network-sidebar.types";
import { NetworkSidebar } from "./_components/network-sidebar/NetworkSidebar";
import { ProfileSidebar } from "./_components/profile-sidebar/ProfileSidebar";
import { networkService } from "./_services/feed/network/NetworkService";
import { postService } from "./_services/PostService";

export default function FeedPage() {
  const t = useTranslations("FeedPage");

  const [posts, setPosts] = useState<Post[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ReceivedFriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<SentFriendRequest[]>([]);
  const [friendSuggestions, setFriendSuggestions] = useState<FriendSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchPosts() {
      try {
        const fetchedPosts = await postService.getAllPosts();
        if (isMounted) setPosts(fetchedPosts);
      } catch {
        if (isMounted) toast.error(t("toasts.loadPostsError"));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    async function fetchReceivedRequests() {
      try {
        const fetchedReceivedRequests = await networkService.getAllReceivedRequests();
        if (isMounted) setReceivedRequests(fetchedReceivedRequests);
      } catch {
        if (isMounted) toast.error(t("toasts.loadReceivedRequestsError"));
      }
    }

    async function fetchSentRequests() {
      try {
        const fetchedSentRequests = await networkService.getAllSentRequests();
        if (isMounted) setSentRequests(fetchedSentRequests);
      } catch {
        if (isMounted) toast.error(t("toasts.loadSentRequestsError"));
      }
    }

    async function fetchFriendSuggestions() {
      try {
        const fetchedFriendSuggestions = await networkService.getFriendSuggestions();
        if (isMounted) setFriendSuggestions(fetchedFriendSuggestions);
      } catch {
        if (isMounted) toast.error(t("toasts.loadSuggestionsError"));
      }
    }

    fetchPosts();
    fetchReceivedRequests();
    fetchSentRequests();
    fetchFriendSuggestions();

    return () => {
      isMounted = false;
    };
  }, [t]);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await networkService.acceptRequest(requestId);
      setReceivedRequests((prev) => prev.filter((req) => req.id !== requestId));
      toast.success(t("toasts.acceptSuccess"));
    } catch {
      toast.error(t("toasts.acceptError"));
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await networkService.declineRequest(requestId);
      setReceivedRequests((prev) => prev.filter((req) => req.id !== requestId));
      toast.success(t("toasts.declineSuccess"));
    } catch {
      toast.error(t("toasts.declineError"));
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await networkService.cancelRequest(requestId);
      setSentRequests((prev) => prev.filter((req) => req.id !== requestId));
      toast.success(t("toasts.cancelSuccess"));
    } catch {
      toast.error(t("toasts.cancelError"));
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    try {
      await networkService.sendFriendRequest(userId);
      toast.success(t("toasts.sendSuccess"));
    } catch {
      toast.error(t("toasts.sendError"));
    }
  };

  return (
    <main className="h-dvh w-full overflow-hidden bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto flex h-dvh max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid h-full min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-12">
          <ProfileSidebar />
          {isLoading ? (
            <div className="col-span-1 flex items-center justify-center lg:col-span-6">
              <p className="animate-pulse text-zinc-500">{t("loading")}</p>
            </div>
          ) : (
            <FeedSection posts={posts} />
          )}

          <NetworkSidebar
            receivedRequests={receivedRequests}
            sentRequests={sentRequests}
            suggestions={friendSuggestions}
            onAcceptRequest={handleAcceptRequest}
            onDeclineRequest={handleDeclineRequest}
            onCancelRequest={handleCancelRequest}
            onSendRequest={handleSendFriendRequest}
          />
        </div>
      </div>
    </main>
  );
}
