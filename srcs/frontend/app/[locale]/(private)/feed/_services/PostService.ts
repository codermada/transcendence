import type { Post } from "@/app/[locale]/(private)/feed/_components/feed-section/feed-section.types";

export interface CreatePostDto {
  content: string;
  files?: File[];
}

export interface UpdatePostDto {
  content: string;
  keptMediaUrls?: string[];
  newFiles?: File[];
}

export interface GetPostsFilterDto {
  page?: number;
  search?: string;
}

const API_URL = "/nest";

export const postService = {
  async getAllPosts(filters?: GetPostsFilterDto): Promise<Post[]> {
    const queryParams = new URLSearchParams();

    if (filters?.page) {
      queryParams.append("page", filters.page.toString());
    }
    if (filters?.search) {
      queryParams.append("search", filters.search);
    }

    const queryString = queryParams.toString();
    const url = queryString ? `${API_URL}/posts?${queryString}` : `${API_URL}/posts`;

    const response = await fetch(url, {
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

  async createPost(
    dto: CreatePostDto,
    onProgress?: (progress: number) => void
  ): Promise<Post> {
    const formData = new FormData();
    formData.append("content", dto.content);

    if (dto.files && dto.files.length > 0) {
      dto.files.forEach((file) => {
        formData.append("files", file);
      });
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_URL}/posts`, true);
      xhr.withCredentials = true;

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        };
      }

      xhr.onload = () => {
        let responseData: any = {};
        try {
          responseData = JSON.parse(xhr.responseText);
        } catch {
          responseData = {};
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(responseData as Post);
        } else {
          reject(
            new Error(
              responseData.message || "Erreur lors de la création du post"
            )
          );
        }
      };

      xhr.onerror = () => {
        reject(new Error("Erreur réseau lors de la création du post"));
      };

      xhr.send(formData);
    });
  },

  async updatePost(postId: string, dto: UpdatePostDto): Promise<Post> {
    const formData = new FormData();
    formData.append("content", dto.content);

    if (dto.keptMediaUrls && dto.keptMediaUrls.length > 0) {
      dto.keptMediaUrls.forEach((url) => {
        formData.append("mediaUrls", url);
      });
    }

    if (dto.newFiles && dto.newFiles.length > 0) {
      dto.newFiles.forEach((file) => {
        formData.append("files", file);
      });
    }

    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: "PATCH",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erreur lors de la modification du post");
    }

    return response.json();
  },

  async deletePost(postId: string): Promise<void> {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erreur lors de la suppression du post");
    }
  },
  async adminDeletePost(postId: string): Promise<void> {
    const response = await fetch(`${API_URL}/posts/${postId}/admin`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Erreur lors de la suppression du post (admin)"
      );
    }
  },
};