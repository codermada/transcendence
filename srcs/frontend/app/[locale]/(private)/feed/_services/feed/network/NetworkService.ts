import { FriendSuggestion, ReceivedFriendRequest, SentFriendRequest } from "../../../_components/network-sidebar/network-sidebar.types";

const API_URL = "/nest";

export const networkService = {
  async getAllReceivedRequests(): Promise<ReceivedFriendRequest[]> {
    const response = await fetch(`${API_URL}/feed-friends/received`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error");
    }

    return response.json();
  },

  async getAllSentRequests(): Promise<SentFriendRequest[]> {
    const response = await fetch(`${API_URL}/feed-friends/sent`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error");
    }

    return response.json();
  },

  async getAllFriendSuggestions(): Promise<FriendSuggestion[]> {
    const response = await fetch(`${API_URL}/feed-friends/suggestions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error");
    }

    return response.json();
  },
};