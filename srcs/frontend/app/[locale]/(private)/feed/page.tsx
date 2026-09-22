"use client";

import { useEffect, useState } from "react";
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
        console.error("Erreur de chargement des posts :", error);
      }
    }

    async function fetchSentRequests() {
      try {
        const fetchedSentRequests = await networkService.getAllSentRequests();
        
        if (isMounted) {
          setSentRequests(fetchedSentRequests);
        }
      } catch (error: any) {
        console.error("Erreur de chargement des posts :", error);
        throw new Error(error.message);
      }
    }

    fetchPosts();
    fetchReceivedRequests();
    fetchSentRequests();

    // if (isMounted) {
    //     setIsLoading(false);
    // }

    return () => {
      isMounted = false;
    };
  }, []);

  const networkData = {
    receivedRequests: [
      {
        id: '1',
        requester: {
          id: '1',
          name: "John Doe",
          initials: "JD",
        }
      },
      {
        id: '2',
        requester: {
          id: '2',
          initials: "JD",
          name: "Jane Doe",
        }
      },
      {
        id: '3',
        requester: {
          id: '3',
          name: "Koto Koto",
          initials: "KK",
        }
      },
      {
        id: '4',
        requester: {
          id: '4',
          name: "Soa Kely",
          initials: "SK",
        }
      },
    ],
    sentRequests: [
      {
        id: '5',
        addressee: {
          id: '5',
          initials: "MK",
          name: "Miora Karen",
        }
      },
      {
        id: '6',
        addressee: {
          id: '6',
          initials: "AR",
          name: "Alida Rak",
        }
      },
      {
        id: '7',
        addressee: {
          id: '7',
          initials: "TM",
          name: "Tsinjo Mikolo",
        }
      },
      {
        id: '8',
        addressee: {
          id: '8',
          initials: "FE",
          name: "Faniry Emmanuel",
        }
      },
    ],
    suggestions: [
      {
        id: '9',
        initials: "AM",
        name: "Antsa Mioty",
        mutualFriends: 0
      },
    ],
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
          />
        </div>
      </div>
    </main>
  );
}