export interface UserProfileResponse {
	name: string,
	username: string,
  email: string,
	initials: string,
  image: string | null,
	stats: {
		friendsCount: number,
		postsCount: number,
		reactionsCount: number,
	},
}

const API_URL = "/nest";

export const profileService = {
  async getUserProfile(): Promise<UserProfileResponse> {
    const response = await fetch(`${API_URL}/feed-profile`, {
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