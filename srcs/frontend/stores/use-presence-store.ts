import { create } from "zustand";
import { getNamespaceSocket } from "@/lib/socket/socket-client";

export type PresenceStatus = "ONLINE" | "OFFLINE";

export interface PresenceState {
  isConnected: boolean;
  onlineUserIds: string[];

  setConnected: (connected: boolean) => void;
  setOnlineUserIds: (userIds: string[]) => void;
  handlePresenceChanged: (userId: string, status: PresenceStatus) => void;
  reset: () => void;

  checkIsOnline: (targetUserId?: string | null) => boolean;

  connect: (userId: string) => () => void;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  isConnected: false,
  onlineUserIds: [],

  setConnected: (connected: boolean) => set({ isConnected: connected }),

  setOnlineUserIds: (userIds: string[]) => set({ onlineUserIds: userIds }),

  handlePresenceChanged: (userId: string, status: PresenceStatus) =>
    set((state) => {
      if (status === "ONLINE") {
        return {
          onlineUserIds: state.onlineUserIds.includes(userId)
            ? state.onlineUserIds
            : [...state.onlineUserIds, userId],
        };
      } else {
        return {
          onlineUserIds: state.onlineUserIds.filter((id) => id !== userId),
        };
      }
    }),

  reset: () => set({ isConnected: false, onlineUserIds: [] }),

  checkIsOnline: (targetUserId?: string | null) => {
    if (!targetUserId) return false;
    return get().onlineUserIds.includes(targetUserId);
  },

  connect: (userId: string) => {
    if (!userId) return () => {};

    const socket = getNamespaceSocket("/presence");

    const onConnect = () => {
      set({ isConnected: true });
    };

    const onDisconnect = () => {
      set({ isConnected: false });
    };

    const onInitialState = (data: { onlineUserIds: string[] }) => {
      if (Array.isArray(data?.onlineUserIds)) {
        set({ onlineUserIds: data.onlineUserIds });
      }
    };

    const onPresenceChanged = (data: { userId: string; status: PresenceStatus }) => {
      if (data?.userId && data?.status) {
        get().handlePresenceChanged(data.userId, data.status);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("presence_initial_state", onInitialState);
    socket.on("presence_changed", onPresenceChanged);

    if (!socket.connected) {
      socket.connect();
    } else {
      set({ isConnected: true });
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("presence_initial_state", onInitialState);
      socket.off("presence_changed", onPresenceChanged);
      socket.disconnect();
      get().reset();
    };
  },
}));
