"use client";

import { useChannelRoomSocket } from "@/hooks/use-channel-socket";
import { useRouter } from "@/i18n/routing";
import { useSession } from "@/lib/auth/use-session";
import { useChannelStore } from "@/stores/use-channel-store";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  addMemberToChannel,
  deleteChannel,
  fetchChannelDetails,
  fetchChannelMessages,
  kickMemberFromChannel,
  leaveChannel,
  markChannelAsSeen,
  sendChannelMessage,
  updateMemberRole,
} from "../_services/channel-service";
import { ChannelHeader } from "./_components/ChannelHeader";
import { ChannelInput } from "./_components/ChannelInput";
import { ChannelMembersModal } from "./_components/ChannelMembersModal";
import { ChannelMessages } from "./_components/ChannelMessages";
import { ChannelSettingsModal } from "./_components/ChannelSettingsModal";
import type { SelectedFile } from "./_components/channel.types";

interface ChannelConversationClientProps {
  channelId: string;
}

export function ChannelConversationClient({ channelId }: ChannelConversationClientProps) {
  const router = useRouter();
  const { data: session } = useSession();

  useChannelRoomSocket(channelId);

  const t = useTranslations("Channels");
  const activeMessages = useChannelStore((state) => state.activeMessages);
  const setActiveMessages = useChannelStore((state) => state.setActiveMessages);
  const setActiveChannelId = useChannelStore((state) => state.setActiveChannelId);
  const addActiveMessage = useChannelStore((state) => state.addActiveMessage);
  const activeChannel = useChannelStore((state) => state.activeChannel);
  const setActiveChannel = useChannelStore((state) => state.setActiveChannel);
  const handleChannelUpdated = useChannelStore((state) => state.handleChannelUpdated);

  const currentUserId = session?.user?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedFilesRef = useRef(selectedFiles);
  const lastMarkedMsgIdRef = useRef<string | null>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  const markAsSeen = useCallback(async () => {
    if (!channelId) return;
    try {
      await markChannelAsSeen(channelId);
    } catch {}
  }, [channelId]);

  useEffect(() => {
    setActiveChannelId(channelId);
    lastMarkedMsgIdRef.current = null;
    return () => {
      setActiveChannelId(null);
    };
  }, [channelId, setActiveChannelId]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [channelData, messagesData] = await Promise.all([
          fetchChannelDetails(channelId),
          fetchChannelMessages(channelId),
        ]);

        if (!cancelled) {
          setActiveChannel(channelData);
          setActiveMessages(messagesData);
          setLoading(false);
          setTimeout(() => scrollToBottom(false), 50);
        }

        await markAsSeen();
      } catch (err: unknown) {
        if (!cancelled) {
          setError((err as Error).message || t("error.channelLoding"));
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [channelId, setActiveChannel, setActiveMessages, scrollToBottom, markAsSeen]);

  useEffect(() => {
    if (!loading && activeMessages.length > 0) {
      scrollToBottom(true);
    }
  }, [activeMessages.length, loading, scrollToBottom]);

  // Mark as seen when receiving incoming messages from other members
  useEffect(() => {
    if (!currentUserId || activeMessages.length === 0) return;

    const lastMsg = activeMessages[activeMessages.length - 1];
    if (
      lastMsg.userId !== currentUserId &&
      !lastMsg.seenBy?.includes(currentUserId) &&
      lastMarkedMsgIdRef.current !== lastMsg.id
    ) {
      lastMarkedMsgIdRef.current = lastMsg.id;
      markAsSeen();
    }
  }, [activeMessages, currentUserId, markAsSeen]);

  useEffect(() => {
    selectedFilesRef.current = selectedFiles;
  }, [selectedFiles]);

  useEffect(() => {
    return () => {
      selectedFilesRef.current.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    };
  }, []);

  const handleAddFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const newFiles: SelectedFile[] = fileArray.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      isImage: file.type.startsWith("image/"),
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (idToRemove: string) => {
    setSelectedFiles((prev) => {
      const target = prev.find((item) => item.id === idToRemove);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== idToRemove);
    });
  };

  const handleSendMessage = async () => {
    const content = inputValue.trim();
    const hasFiles = selectedFiles.length > 0;
    if ((!content && !hasFiles) || isSending) return;

    setIsSending(true);

    try {
      const files = selectedFiles.map((item) => item.file);
      const createdMessage = await sendChannelMessage(channelId, content, files);

      addActiveMessage(createdMessage);

      selectedFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setSelectedFiles([]);
      setInputValue("");
      scrollToBottom(true);
    } catch (err: unknown) {
      toast.error((err as Error)?.message || t("error.sendingMessage"));
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleLeaveChannel = async () => {
    try {
      await leaveChannel(channelId);
      toast.success(t("success.youLeftChannel"));
      router.push("/channels");
    } catch (err: unknown) {
      toast.error((err as Error).message || t("error.leavingChannel"));
    }
  };

  const handleDeleteChannel = async () => {
    try {
      await deleteChannel(channelId);
      toast.success(t("success.channelRemoved"));
      router.push("/channels");
    } catch (err: unknown) {
      toast.error((err as Error).message || t("error.deletingChannel"));
    }
  };

  const handleKickMember = async (targetUserId: string) => {
    try {
      await kickMemberFromChannel(channelId, targetUserId);
      toast.success(t("success.memberFired"));
      if (activeChannel) {
        setActiveChannel({
          ...activeChannel,
          members: activeChannel.members.filter((m) => m.userId !== targetUserId),
        });
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || t("error.firingMember"));
    }
  };

  const handleUpdateRole = async (targetUserId: string, role: "ADMIN" | "MEMBER") => {
    try {
      await updateMemberRole(channelId, targetUserId, role);
      toast.success(t("success.roleUpdated"));
      if (activeChannel) {
        setActiveChannel({
          ...activeChannel,
          members: activeChannel.members.map((m) =>
            m.userId === targetUserId ? { ...m, role } : m,
          ),
        });
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || t("error.updatingRole"));
    }
  };

  const handleAddMember = async (memberId: string) => {
    try {
      await addMemberToChannel(channelId, memberId);
      toast.success(t("success.memberAdded"));
      const refreshed = await fetchChannelDetails(channelId);
      setActiveChannel(refreshed);
    } catch (err: unknown) {
      toast.error((err as Error).message || t("error.addingNewMember"));
    }
  };

  const canSend = Boolean(inputValue.trim() || selectedFiles.length > 0);

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col p-3 sm:p-6">
      <ChannelHeader
        channel={activeChannel}
        onOpenMembersModal={() => setMembersModalOpen(true)}
        onOpenChannelSettings={() => setSettingsModalOpen(true)}
      />

      <ChannelMessages
        loading={loading}
        error={error}
        messages={activeMessages}
        members={activeChannel?.members}
        currentUserId={currentUserId}
        messagesEndRef={messagesEndRef}
      />

      <ChannelInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        selectedFiles={selectedFiles}
        onAddFiles={handleAddFiles}
        onRemoveFile={handleRemoveFile}
        onSend={handleSendMessage}
        disabled={loading}
        isSending={isSending}
        canSend={canSend}
        inputRef={inputRef}
      />

      {membersModalOpen && activeChannel && currentUserId && (
        <ChannelMembersModal
          channel={activeChannel}
          currentUserId={currentUserId}
          isOpen={membersModalOpen}
          onClose={() => setMembersModalOpen(false)}
          onLeaveChannel={handleLeaveChannel}
          onDeleteChannel={handleDeleteChannel}
          onKickMember={handleKickMember}
          onUpdateRole={handleUpdateRole}
          onAddMember={handleAddMember}
        />
      )}

      {settingsModalOpen && activeChannel && (
        <ChannelSettingsModal
          channel={activeChannel}
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          onUpdated={(updated) => {
            handleChannelUpdated(updated);
          }}
        />
      )}
    </div>
  );
}
