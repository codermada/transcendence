import { create } from "zustand";

export interface ChannelParticipant {
  id: string;
  name: string | null;
  image: string | null;
  email?: string;
}

export interface ChannelMemberItem {
  userId: string;
  channelId: string;
  role: "ADMIN" | "MEMBER";
  joinedAt: string;
  user: ChannelParticipant;
}

export interface ChannelListItem {
  id: string;
  title: string;
  description: string;
  mediaUrl: string | null;
  createdById: string;
  createdAt: string;
  updatedat: string;
  unreadCount?: number;
  lastMessage?: {
    id: string;
    content: string;
    mediaUrls?: string[];
    createdAt: string;
    userId?: string;
  } | null;
  _count?: {
    messages?: number;
    members?: number;
  };
  members?: {
    role: "ADMIN" | "MEMBER";
    joinedAt: string;
  }[];
}

export interface ChannelDetail {
  id: string;
  title: string;
  description: string;
  mediaUrl: string | null;
  createdById: string;
  createdAt: string;
  updatedat: string;
  members: ChannelMemberItem[];
}

export interface ChannelMessage {
  id: string;
  userId: string;
  channelId: string;
  content: string;
  mediaUrls: string[];
  seenBy: string[];
  createdAt: string;
  updatedat: string;
  user: ChannelParticipant;
}

export interface ChannelState {
  channels: ChannelListItem[];
  activeChannelId: string | null;
  activeChannel: ChannelDetail | null;
  activeMessages: ChannelMessage[];
  isConnected: boolean;

  setConnected: (connected: boolean) => void;
  setChannels: (channels: ChannelListItem[]) => void;
  setActiveChannelId: (id: string | null) => void;
  setActiveChannel: (channel: ChannelDetail | null) => void;
  setActiveMessages: (messages: ChannelMessage[]) => void;
  addActiveMessage: (message: ChannelMessage) => void;

  handleNewMessage: (message: ChannelMessage, currentUserId?: string) => void;
  handleMessagesSeen: (channelId: string, seenByUserId: string, currentUserId?: string) => void;
  handleChannelCreated: (channel: ChannelDetail | ChannelListItem) => void;
  handleMemberJoined: (channelId: string, member: ChannelMemberItem) => void;
  handleMemberLeft: (channelId: string, userId: string, currentUserId?: string) => void;
  handleRoleUpdated: (channelId: string, userId: string, role: "ADMIN" | "MEMBER", currentUserId?: string) => void;
  handleChannelDeleted: (channelId: string) => void;
  handleChannelUpdated: (channel: Partial<ChannelDetail> & { id: string }) => void;

  getTotalUnreadCount: () => number;
  reset: () => void;
}

export const useChannelStore = create<ChannelState>((set, get) => ({
  channels: [],
  activeChannelId: null,
  activeChannel: null,
  activeMessages: [],
  isConnected: false,

  setConnected: (connected: boolean) => set({ isConnected: connected }),

  setChannels: (channels: ChannelListItem[]) => set({ channels }),

  setActiveChannelId: (id: string | null) =>
    set((state) => {
      if (id) {
        const updated = state.channels.map((c) =>
          c.id === id ? { ...c, unreadCount: 0 } : c,
        );
        return { activeChannelId: id, channels: updated };
      }
      return { activeChannelId: id };
    }),

  setActiveChannel: (channel: ChannelDetail | null) => set({ activeChannel: channel }),

  setActiveMessages: (messages: ChannelMessage[]) => set({ activeMessages: messages }),

  addActiveMessage: (message: ChannelMessage) =>
    set((state) => {
      if (state.activeMessages.some((m) => m.id === message.id)) {
        return state;
      }
      return { activeMessages: [...state.activeMessages, message] };
    }),

  handleNewMessage: (message: ChannelMessage, currentUserId?: string) => {
    set((state) => {
      const channelId = message.channelId;
      const isCurrentChannelActive = state.activeChannelId === channelId;
      const isSentByMe = Boolean(currentUserId && message.userId === currentUserId);

      let nextActiveMessages = state.activeMessages;
      if (isCurrentChannelActive) {
        if (!state.activeMessages.some((m) => m.id === message.id)) {
          nextActiveMessages = [...state.activeMessages, message];
        }
      }

      const existingIndex = state.channels.findIndex((c) => c.id === channelId);
      const nextChannels = [...state.channels];

      if (existingIndex !== -1) {
        const current = state.channels[existingIndex];
        const newUnreadCount =
          !isSentByMe && !isCurrentChannelActive
            ? (current.unreadCount || 0) + 1
            : isCurrentChannelActive
            ? 0
            : current.unreadCount || 0;

        const updatedChannel: ChannelListItem = {
          ...current,
          updatedat: message.createdAt,
          unreadCount: newUnreadCount,
          lastMessage: {
            id: message.id,
            content: message.content,
            mediaUrls: message.mediaUrls,
            createdAt: message.createdAt,
            userId: message.userId,
          },
          _count: {
            messages: (current._count?.messages || 0) + 1,
            members: current._count?.members,
          },
        };

        nextChannels.splice(existingIndex, 1);
        nextChannels.unshift(updatedChannel);
      }

      return {
        activeMessages: nextActiveMessages,
        channels: nextChannels,
      };
    });
  },

  handleMessagesSeen: (channelId: string, seenByUserId: string, currentUserId?: string) => {
    set((state) => {
      let nextActiveMessages = state.activeMessages;
      if (state.activeChannelId === channelId) {
        nextActiveMessages = state.activeMessages.map((m) => {
          if (!m.seenBy?.includes(seenByUserId)) {
            return {
              ...m,
              seenBy: [...(m.seenBy || []), seenByUserId],
            };
          }
          return m;
        });
      }

      let nextChannels = state.channels;
      if (currentUserId && seenByUserId === currentUserId) {
        nextChannels = state.channels.map((c) =>
          c.id === channelId ? { ...c, unreadCount: 0 } : c,
        );
      }

      return {
        activeMessages: nextActiveMessages,
        channels: nextChannels,
      };
    });
  },

  handleChannelCreated: (channel: ChannelDetail | ChannelListItem) => {
    set((state) => {
      if (state.channels.some((c) => c.id === channel.id)) {
        return state;
      }

      let membersList: { role: "ADMIN" | "MEMBER"; joinedAt: string }[] | undefined;
      if (channel.members && Array.isArray(channel.members)) {
        membersList = channel.members.map((m) => ({
          role: m.role,
          joinedAt: typeof m.joinedAt === "string" ? m.joinedAt : new Date().toISOString(),
        }));
      }

      const newListItem: ChannelListItem = {
        id: channel.id,
        title: channel.title,
        description: channel.description,
        mediaUrl: channel.mediaUrl,
        createdById: channel.createdById,
        createdAt: channel.createdAt,
        updatedat: channel.updatedat,
        unreadCount: 0,
        _count: {
          messages: 0,
          members: membersList ? membersList.length : 1,
        },
        members: membersList,
      };

      return { channels: [newListItem, ...state.channels] };
    });
  },

  handleMemberJoined: (channelId: string, member: ChannelMemberItem) => {
    set((state) => {
      let nextActiveChannel = state.activeChannel;
      if (state.activeChannel && state.activeChannel.id === channelId) {
        if (!state.activeChannel.members.some((m) => m.userId === member.userId)) {
          nextActiveChannel = {
            ...state.activeChannel,
            members: [...state.activeChannel.members, member],
          };
        }
      }

      const nextChannels = state.channels.map((c) => {
        if (c.id === channelId) {
          return {
            ...c,
            _count: {
              messages: c._count?.messages,
              members: (c._count?.members || 0) + 1,
            },
          };
        }
        return c;
      });

      return { activeChannel: nextActiveChannel, channels: nextChannels };
    });
  },

  handleMemberLeft: (channelId: string, userId: string, currentUserId?: string) => {
    set((state) => {
      if (currentUserId && userId === currentUserId) {
        return {
          channels: state.channels.filter((c) => c.id !== channelId),
          activeChannel: state.activeChannel?.id === channelId ? null : state.activeChannel,
          activeChannelId: state.activeChannelId === channelId ? null : state.activeChannelId,
        };
      }

      let nextActiveChannel = state.activeChannel;
      if (state.activeChannel && state.activeChannel.id === channelId) {
        nextActiveChannel = {
          ...state.activeChannel,
          members: state.activeChannel.members.filter((m) => m.userId !== userId),
        };
      }

      const nextChannels = state.channels.map((c) => {
        if (c.id === channelId) {
          return {
            ...c,
            _count: {
              messages: c._count?.messages,
              members: Math.max(0, (c._count?.members || 1) - 1),
            },
          };
        }
        return c;
      });

      return { activeChannel: nextActiveChannel, channels: nextChannels };
    });
  },

  handleRoleUpdated: (channelId: string, userId: string, role: "ADMIN" | "MEMBER", currentUserId?: string) => {
    set((state) => {
      let nextActiveChannel = state.activeChannel;
      if (state.activeChannel && state.activeChannel.id === channelId) {
        nextActiveChannel = {
          ...state.activeChannel,
          members: state.activeChannel.members.map((m) =>
            m.userId === userId ? { ...m, role } : m,
          ),
        };
      }

      const nextChannels = state.channels.map((c) => {
        if (c.id === channelId && currentUserId && userId === currentUserId && c.members) {
          return {
            ...c,
            members: c.members.map((m) => ({ ...m, role })),
          };
        }
        return c;
      });

      return { activeChannel: nextActiveChannel, channels: nextChannels };
    });
  },

  handleChannelDeleted: (channelId: string) => {
    set((state) => ({
      channels: state.channels.filter((c) => c.id !== channelId),
      activeChannel: state.activeChannel?.id === channelId ? null : state.activeChannel,
      activeChannelId: state.activeChannelId === channelId ? null : state.activeChannelId,
    }));
  },

  handleChannelUpdated: (channel: Partial<ChannelDetail> & { id: string }) => {
    set((state) => {
      let nextActiveChannel = state.activeChannel;
      if (state.activeChannel && state.activeChannel.id === channel.id) {
        nextActiveChannel = {
          ...state.activeChannel,
          title: channel.title !== undefined ? channel.title : state.activeChannel.title,
          description:
            channel.description !== undefined
              ? channel.description
              : state.activeChannel.description,
          mediaUrl:
            channel.mediaUrl !== undefined
              ? channel.mediaUrl
              : state.activeChannel.mediaUrl,
          updatedat: channel.updatedat || new Date().toISOString(),
          // Preserve existing members untouched as requested
          members: state.activeChannel.members,
        };
      }

      const nextChannels = state.channels.map((c) => {
        if (c.id === channel.id) {
          return {
            ...c,
            title: channel.title !== undefined ? channel.title : c.title,
            description:
              channel.description !== undefined
                ? channel.description
                : c.description,
            mediaUrl:
              channel.mediaUrl !== undefined ? channel.mediaUrl : c.mediaUrl,
            updatedat: channel.updatedat || new Date().toISOString(),
          };
        }
        return c;
      });

      return {
        activeChannel: nextActiveChannel,
        channels: nextChannels,
      };
    });
  },

  getTotalUnreadCount: () => {
    return get().channels.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  },

  reset: () =>
    set({
      channels: [],
      activeChannelId: null,
      activeChannel: null,
      activeMessages: [],
      isConnected: false,
    }),
}));
