
export interface MediaPreview {
  id: string;
  file: File;
  url: string;
  type: "image" | "video";
}

export interface Post {
  id: string;
  author: string;
  initials: string;
  authorImage?: string;
  createdAt: string;
  content: string;
  mediaUrls: string[];
  postCount: number;
  likesCount: number;
  commentsCount: number;
  isOwner: boolean;
  isLiked?: boolean;
}
export interface FeedSectionProps {
  posts?: Post[];
}

export interface PostCardProps {
  postId: string;
  author: string;
  initials: string;
  createdAt: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  mediaUrls?: string[];
  isOwner?: boolean;
  isLiked?: boolean;
}

export interface PostHeaderProps {
  author: string;
  initials: string;
  createdAt?: string | Date;
}

export interface PostActionsProps {
  postId: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  onToggleLike?: (postId: string) => Promise<void>;
}

export interface CreatePostCardProps {
  onPostCreated?: (newPost: Post) => void;
}

export interface CommentUser {
  name: string;
  pseudo: string;
  image?: string | null;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  mediaUrl?: string | null;

  createdAt: string;
  updatedAt: string;

  likesCount: number;

  isLikedByCurrentUser: boolean;
  isCommentByCurrentUser: boolean;

  user: CommentUser;
}

export interface CreateCommentPayload {
  postId: string;
  content: string;
  image?: File | null;
}
