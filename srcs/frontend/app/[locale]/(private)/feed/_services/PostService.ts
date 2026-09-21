import type { Post } from "@/app/[locale]/(private)/feed/_components/feed-section/feed-section.types";

export interface CreatePostDto {
  content: string;
  files?: File[];
}

const API_URL = "/nest";

export const postService = {
  async getAllPosts(): Promise<Post[]> {
    const response = await fetch(`${API_URL}/posts`, {
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

  async createPost(dto: CreatePostDto): Promise<Post> {
    const formData = new FormData();
    formData.append("content", dto.content);

    if (dto.files && dto.files.length > 0) {
      dto.files.forEach((file) => {
        formData.append("files", file);
      });
    }

    const response = await fetch(`${API_URL}/posts`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erreur lors de la création du post");
    }

    return response.json();
  },
};