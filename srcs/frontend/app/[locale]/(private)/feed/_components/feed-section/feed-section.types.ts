import { ReactNode } from "react";

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
  timeAgo: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  mediaUrl?: string;
}

export interface FeedSectionProps {
  posts?: Post[];
}

export interface PostCardProps {
  author: string;
  initials: string;
  timeAgo: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  children?: ReactNode;
}

export interface PostHeaderProps {
  author: string;
  initials: string;
  timeAgo: string;
}

export interface PostActionsProps {
  likesCount: number;
  commentsCount: number;
}