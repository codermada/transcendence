"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth/use-session";
import { getNamespaceSocket } from "@/lib/socket/socket-client";
import {
  useChannelStore,
  ChannelDetail,
  ChannelMemberItem,
  ChannelMessage,
} from "@/stores/use-channel-store";

export function useChannelSocketInit() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const setChannels = useChannelStore((s) => s.setChannels);
  const handleNewMessage = useChannelStore((s) => s.handleNewMessage);
  const handleMessagesSeen = useChannelStore((s) => s.handleMessagesSeen);
  const handleChannelCreated = useChannelStore((s) => s.handleChannelCreated);
  const handleMemberJoined = useChannelStore((s) => s.handleMemberJoined);
  const handleMemberLeft = useChannelStore((s) => s.handleMemberLeft);
  const handleRoleUpdated = useChannelStore((s) => s.handleRoleUpdated);
  const handleChannelDeleted = useChannelStore((s) => s.handleChannelDeleted);
  const setConnected = useChannelStore((s) => s.setConnected);
  const reset = useChannelStore((s) => s.reset);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function loadInitialChannels() {
      try {
        const res = await fetch("/nest/channels/my", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && Array.isArray(data)) {
            setChannels(data);
          }
        }
      } catch {
        // Ignored
      }
    }

    loadInitialChannels();

    return () => {
      cancelled = true;
    };
  }, [userId, setChannels]);

  useEffect(() => {
    if (!userId) return;

    const socket = getNamespaceSocket("/channels");

    const onConnect = () => {
      setConnected(true);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onNewMessage = (message: ChannelMessage) => {
      handleNewMessage(message, userId);
    };

    const onChannelCreated = (channel: ChannelDetail) => {
      handleChannelCreated(channel);
    };

    const onMemberJoined = (data: { channelId: string; member: ChannelMemberItem }) => {
      if (data?.channelId && data?.member) {
        handleMemberJoined(data.channelId, data.member);
      }
    };

    const onMemberLeft = (data: { channelId: string; userId: string; reason: string }) => {
      if (data?.channelId && data?.userId) {
        handleMemberLeft(data.channelId, data.userId, userId);
      }
    };

    const onRoleUpdated = (data: { channelId: string; userId: string; role: "ADMIN" | "MEMBER" }) => {
      if (data?.channelId && data?.userId && data?.role) {
        handleRoleUpdated(data.channelId, data.userId, data.role, userId);
      }
    };

    const onChannelDeleted = (data: { channelId: string }) => {
      if (data?.channelId) {
        handleChannelDeleted(data.channelId);
      }
    };

    const onChannelAddedYou = async () => {
      try {
        const res = await fetch("/nest/channels/my", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setChannels(data);
          }
        }
      } catch {
        // Ignored
      }
    };

    const onChannelRemovedYou = (data: { channelId: string }) => {
      if (data?.channelId) {
        handleChannelDeleted(data.channelId);
      }
    };

    const onMessagesSeen = (data: { channelId: string; userId: string }) => {
      if (data?.channelId && data?.userId) {
        handleMessagesSeen(data.channelId, data.userId, userId);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new_channel_message", onNewMessage);
    socket.on("channel_messages_seen", onMessagesSeen);
    socket.on("channel_created", onChannelCreated);
    socket.on("channel_member_joined", onMemberJoined);
    socket.on("channel_member_left", onMemberLeft);
    socket.on("channel_role_updated", onRoleUpdated);
    socket.on("channel_deleted", onChannelDeleted);
    socket.on("channel_added_you", onChannelAddedYou);
    socket.on("channel_removed_you", onChannelRemovedYou);

    if (!socket.connected) {
      socket.connect();
    } else {
      setConnected(true);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new_channel_message", onNewMessage);
      socket.off("channel_messages_seen", onMessagesSeen);
      socket.off("channel_created", onChannelCreated);
      socket.off("channel_member_joined", onMemberJoined);
      socket.off("channel_member_left", onMemberLeft);
      socket.off("channel_role_updated", onRoleUpdated);
      socket.off("channel_deleted", onChannelDeleted);
      socket.off("channel_added_you", onChannelAddedYou);
      socket.off("channel_removed_you", onChannelRemovedYou);
      socket.disconnect();
      reset();
    };
  }, [
    userId,
    setChannels,
    handleNewMessage,
    handleMessagesSeen,
    handleChannelCreated,
    handleMemberJoined,
    handleMemberLeft,
    handleRoleUpdated,
    handleChannelDeleted,
    setConnected,
    reset,
  ]);
}

export function useChannelRoomSocket(channelId: string) {
  const socket = getNamespaceSocket("/channels");

  useEffect(() => {
    if (!channelId) return;

    const join = () => {
      socket.emit("join_channel", { channelId });
    };

    if (socket.connected) {
      join();
    } else {
      socket.once("connect", join);
    }

    return () => {
      socket.off("connect", join);
      if (socket.connected) {
        socket.emit("leave_channel", { channelId });
      }
    };
  }, [socket, channelId]);
}
