import type { Comment, CreateCommentPayload} from "../_components/feed-section/feed-section.types";

const API_URL = process.env.NEXT_PUBLIC_NEST_URL || "http://localhost:4000";

interface CreateCommentDto {
  content: string;
  image?: File | null;
}

interface ToggleLikeResult {
  liked: boolean;
  likesCount: number;
}

export const commentService = {
  async getComments(postId: string): Promise<Comment[]> {

    const response = await fetch(`${API_URL}/posts/comments/${postId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erreur lors du chargement des commentaires");
    }

    return await response.json();
  },

  async createComment(dto: CreateCommentDto, postId: string): Promise<Comment> {

    const formData = new FormData();
    formData.append("content", dto.content);
    formData.append("postId", postId);

    if (dto.image) {
      formData.append("file", dto.image);
    }

    const response = await fetch(`${API_URL}/posts/comments`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erreur lors de la création du commentaire");
    }

    return response.json();
  },

  async toggleLike(commentId: string): Promise<ToggleLikeResult> {
    const response = await fetch(`${API_URL}/posts/comments/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ commentId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erreur lors du like");
    }
    
    return response.json();
  },
};