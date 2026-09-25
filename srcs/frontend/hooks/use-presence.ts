"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth/use-session";
import { usePresenceStore } from "@/stores/use-presence-store";

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
