import type {
  ProfileHeaderUser
} from "../_components/profile-header/profile-header.types";

import type { Post } from "@/app/[locale]/(private)/feed/_components/feed-section/feed-section.types";

const API_URL = "/nest";

export const profileServices = {

  async getUserProfileById(id: string): Promise<ProfileHeaderUser> {
    const response = await fetch(`${API_URL}/feed-profile/${id}`, {
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

  async getAssociatedUserIdPosts(id: string): Promise<Post[]> {
    const response = await fetch(`${API_URL}/posts/user/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erreur lors de la récupération des posts");
    }

    return response.json();
  },

};
