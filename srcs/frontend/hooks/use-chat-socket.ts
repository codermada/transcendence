"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth/use-session";
import { getNamespaceSocket } from "@/lib/socket/socket-client";
import { useChatStore, Message } from "@/stores/use-chat-store";

/**
 * Global chat socket lifecycle hook.
 * Call this once in the root authenticated private layout.
 */
export function useChatSocketInit() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const handleNewMessage = useChatStore((s) => s.handleNewMessage);
  const handleMessageSeen = useChatStore((s) => s.handleMessageSeen);
  const setConnected = useChatStore((s) => s.setConnected);
  const reset = useChatStore((s) => s.reset);

  useEffect(() => {
    if (!userId) return;

    const socket = getNamespaceSocket("/chat");

    const onConnect = () => {
      setConnected(true);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onNewMessage = (message: Message) => {
      handleNewMessage(message, userId);
    };

    const onMessageSeen = (data: { conversationId: string; seenByUserId: string; seenAt: string }) => {
      if (data?.conversationId && data?.seenByUserId) {
        handleMessageSeen(data.conversationId, data.seenByUserId, data.seenAt);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new_message", onNewMessage);
    socket.on("message_seen", onMessageSeen);

    if (!socket.connected) {
      socket.connect();
    } else {
      setConnected(true);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new_message", onNewMessage);
      socket.off("message_seen", onMessageSeen);
      socket.disconnect();
      reset();
    };
  }, [userId, handleNewMessage, handleMessageSeen, setConnected, reset]);
}

/**
 * Hook to manage room joining, leaving, and read receipts for an active conversation.
 */
export function useConversationSocket(conversationId: string) {
  const socket = getNamespaceSocket("/chat");

  // Join and quit conversation room on mount / unmount
  useEffect(() => {
    if (!conversationId) return;

    const join = () => {
      socket.emit("join_conversation", { conversationId });
    };

    if (socket.connected) {
      join();
    } else {
      socket.once("connect", join);
    }

    return () => {
      socket.off("connect", join);
      if (socket.connected) {
        socket.emit("quit_conversation", { conversationId });
      }
    };
  }, [socket, conversationId]);
}
