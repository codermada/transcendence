import type { Message } from "@/stores/use-chat-store";

export interface Participant {
  id: string;
  name: string;
  image: string | null;
}

export interface ConversationItem {
  id: string;
  participant?: Participant | null;
  user1?: Participant | null;
  user2?: Participant | null;
  user1Id?: string;
  user2Id?: string;
  unreadCount?: number;
  updatedAt?: string;
}

export interface SelectedFile {
  id: string;
  file: File;
  previewUrl: string;
  isImage: boolean;
}

export type { Message };
