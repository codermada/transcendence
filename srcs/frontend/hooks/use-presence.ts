"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth/use-session";
import { usePresenceStore } from "@/stores/use-presence-store";

/**
 * Initializes and manages the presence socket lifecycle for the authenticated user.
 * Call this once in the root authenticated layout.
 */
export function usePresenceInit() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const connect = usePresenceStore((state) => state.connect);

  useEffect(() => {
    if (!userId) return;

    const disconnect = connect(userId);

    return () => {
      disconnect();
    };
  }, [userId, connect]);
}

/**
 * Hook to consume presence state anywhere in the application.
 */
export function usePresence() {
  const isConnected = usePresenceStore((state) => state.isConnected);
  const onlineUserIds = usePresenceStore((state) => state.onlineUserIds);
  const checkIsOnline = usePresenceStore((state) => state.checkIsOnline);

  return {
    isConnected,
    isOnline: isConnected,
    onlineUserIds,
    checkIsOnline,
  };
}
