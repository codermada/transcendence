export interface ToggleLikeResponse {
  liked: boolean;
  likesCount: number;
}

const API_URL = process.env.NEXT_PUBLIC_NEST_URL || "http://localhost:4000";

export const postLikeService = {
  async toggleLike(postId: string): Promise<ToggleLikeResponse> {
    const response = await fetch(`${API_URL}/posts/likes/toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ postId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erreur lors du toggle du like");
    }

    return response.json();
  },
};