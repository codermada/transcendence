import { create } from "zustand";

export interface Participant {
  id: string;
  name: string;
  image: string | null;
}

export interface LastMessage {
  id: string;
  content: string;
  mediaUrls?: string[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  participant: Participant | null;
  lastMessage: LastMessage | null;
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  messageTableId: string;
  senderId: string;
  receiverId: string;
  content: string;
  mediaUrls?: string[];
  isSeen: boolean;
  seenAt: string | null;
  createdAt: string;
  sender?: Participant;
  receiver?: Participant;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeMessages: Message[];
  isConnected: boolean;

  setConnected: (connected: boolean) => void;
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversationId: (id: string | null) => void;
  setActiveMessages: (messages: Message[]) => void;
  addActiveMessage: (message: Message) => void;

  handleNewMessage: (message: Message, currentUserId: string) => void;
  handleMessageSeen: (conversationId: string, seenByUserId: string, seenAt: string) => void;

  getTotalUnreadCount: () => number;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  activeMessages: [],
  isConnected: false,

  setConnected: (connected: boolean) => set({ isConnected: connected }),

  setConversations: (conversations: Conversation[]) => set({ conversations }),

  setActiveConversationId: (id: string | null) =>
    set((state) => {
      if (id) {
        // Reset unread count for this conversation in the local list
        const updated = state.conversations.map((c) =>
          c.id === id ? { ...c, unreadCount: 0 } : c
        );
        return { activeConversationId: id, conversations: updated };
      }
      return { activeConversationId: id };
    }),

  setActiveMessages: (messages: Message[]) => set({ activeMessages: messages }),

  addActiveMessage: (message: Message) =>
    set((state) => {
      if (state.activeMessages.some((m) => m.id === message.id)) {
        return state;
      }
      return { activeMessages: [...state.activeMessages, message] };
    }),

  handleNewMessage: (message: Message, currentUserId: string) => {
    set((state) => {
      const convId = message.messageTableId;
      const isCurrentConvActive = state.activeConversationId === convId;
      const isSentByMe = message.senderId === currentUserId;

      // 1. If currently in the active conversation, append message if not present
      let nextActiveMessages = state.activeMessages;
      if (isCurrentConvActive) {
        if (!state.activeMessages.some((m) => m.id === message.id)) {
          nextActiveMessages = [...state.activeMessages, message];
        }
      }

      // 2. Update or insert conversation in conversations list
      const existingIndex = state.conversations.findIndex((c) => c.id === convId);
      let updatedConv: Conversation;

      if (existingIndex !== -1) {
        const current = state.conversations[existingIndex];
        const newUnreadCount =
          !isSentByMe && !isCurrentConvActive
            ? (current.unreadCount || 0) + 1
            : isCurrentConvActive
            ? 0
            : current.unreadCount || 0;

        updatedConv = {
          ...current,
          lastMessage: {
            id: message.id,
            content: message.content,
            mediaUrls: message.mediaUrls,
            createdAt: message.createdAt,
          },
          updatedAt: message.createdAt,
          unreadCount: newUnreadCount,
        };
      } else {
        const otherUser = isSentByMe
          ? message.receiver || null
          : message.sender || null;

        updatedConv = {
          id: convId,
          participant: otherUser,
          lastMessage: {
            id: message.id,
            content: message.content,
            mediaUrls: message.mediaUrls,
            createdAt: message.createdAt,
          },
          unreadCount: !isSentByMe && !isCurrentConvActive ? 1 : 0,
          updatedAt: message.createdAt,
        };
      }

      // 3. Move the updated conversation to the top
      const remainingConvs = state.conversations.filter((c) => c.id !== convId);
      const nextConversations = [updatedConv, ...remainingConvs];

      return {
        activeMessages: nextActiveMessages,
        conversations: nextConversations,
      };
    });
  },

  handleMessageSeen: (conversationId: string, seenByUserId: string, seenAt: string) => {
    set((state) => {
      if (state.activeConversationId === conversationId) {
        const nextActiveMessages = state.activeMessages.map((m) => {
          if (m.receiverId === seenByUserId && !m.isSeen) {
            return { ...m, isSeen: true, seenAt };
          }
          return m;
        });
        return { activeMessages: nextActiveMessages };
      }
      return state;
    });
  },

  getTotalUnreadCount: () => {
    return get().conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
  },

  reset: () =>
    set({
      conversations: [],
      activeConversationId: null,
      activeMessages: [],
      isConnected: false,
    }),
}));
