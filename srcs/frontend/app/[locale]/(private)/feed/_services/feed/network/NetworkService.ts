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

  async getFriendSuggestions(): Promise<FriendSuggestion[]> {
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

  async acceptRequest(requestId: string): Promise<void> {
    const response = await fetch(`${API_URL}/feed-friends/accept/${requestId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Impossible d'accepter la demande");
    }
  },

  async declineRequest(requestId: string): Promise<void> {
    const response = await fetch(`${API_URL}/feed-friends/decline/${requestId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Impossible de refuser la demande");
    }
  },

  async cancelRequest(requestId: string): Promise<void> {
    const response = await fetch(`${API_URL}/feed-friends/cancel/${requestId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Impossible d'annuler la demande");
    }
  },

  async sendFriendRequest(addresseeId: string): Promise<SentFriendRequest> {
    const response = await fetch(`${API_URL}/feed-friends/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ addresseeId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Impossible d'envoyer la demande d'ami");
    }

    return response.json();
  },

  async removeFriend(requestId: string): Promise<void> {
    const response = await fetch(`${API_URL}/feed-friends/delete/${requestId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Impossible de refuser la demande");
    }
  },
};