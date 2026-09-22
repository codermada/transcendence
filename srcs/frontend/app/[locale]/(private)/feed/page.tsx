"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Post } from "./_components/feed-section/feed-section.types";
import { FeedSection } from "./_components/feed-section/FeedSection";
import { FriendSuggestion, ReceivedFriendRequest, SentFriendRequest } from "./_components/network-sidebar/network-sidebar.types";
import { NetworkSidebar } from "./_components/network-sidebar/NetworkSidebar";
import { ProfileSidebar } from "./_components/profile-sidebar/ProfileSidebar";
import { networkService } from "./_services/feed/network/NetworkService";
import { postService } from "./_services/PostService";

export default function FeedPage() {
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

    async function fetchReceivedRequests() {
      try {
        const fetchedReceivedRequests = await networkService.getAllReceivedRequests();
        if (isMounted) {
          setReceivedRequests(fetchedReceivedRequests);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des demandes reçues :", error);
      }
    }

    async function fetchSentRequests() {
      try {
        const fetchedSentRequests = await networkService.getAllSentRequests();
        if (isMounted) {
          setSentRequests(fetchedSentRequests);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des demandes envoyées :", error);
      }
    }

    async function fetchFriendSuggestions() {
      try {
        const fetchedFriendSuggestions = await networkService.getFriendSuggestions();
        if (isMounted) {
          setFriendSuggestions(fetchedFriendSuggestions);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des demandes envoyées :", error);
      }
    }

    fetchPosts();
    fetchReceivedRequests();
    fetchSentRequests();
    fetchFriendSuggestions();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await networkService.acceptRequest(requestId);
      setReceivedRequests((prev) => prev.filter((req) => req.id !== requestId));
      toast.success("Demande d'ami acceptée.");
    } catch (error) {
      console.error("Erreur lors de l'acceptation :", error);
      toast.error("Impossible d'accepter la demande.");
      throw error;
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await networkService.declineRequest(requestId);
      setReceivedRequests((prev) => prev.filter((req) => req.id !== requestId));
      toast.success("Demande d'ami refusée.");
    } catch (error) {
      console.error("Erreur lors du refus :", error);
      toast.error("Impossible de refuser la demande.");
      throw error;
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await networkService.cancelRequest(requestId);
      setSentRequests((prev) => prev.filter((req) => req.id !== requestId));
      toast.success("Demande d'ami annulée.");
    } catch (error) {
      console.error("Erreur lors de l'annulation :", error);
      toast.error("Impossible d'annuler la demande.");
      throw error;
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    try {
      await networkService.sendFriendRequest(userId);
      toast.success("Demande d'ami envoyée.");
    } catch (error) {
      console.error("Erreur lors de l'envoi de la demande d'ami :", error);
      toast.error("Impossible d'envoyer une demande d'ami.");
      throw error;
    }
  };

  return (
    <main className="h-dvh w-full overflow-hidden bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto flex h-dvh max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid h-full min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-12">
          <ProfileSidebar />
          {isLoading ? (
            <div className="col-span-1 flex items-center justify-center lg:col-span-6">
              <p className="animate-pulse text-zinc-500">Chargement du fil d'actualité...</p>
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