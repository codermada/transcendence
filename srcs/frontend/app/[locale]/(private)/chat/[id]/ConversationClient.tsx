"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSession } from "@/lib/auth/use-session";
import { usePresence } from "@/hooks/use-presence";
import { useChatStore } from "@/stores/use-chat-store";
import { useConversationSocket } from "@/hooks/use-chat-socket";
import { chatService } from "../_services/chat-service";
import { ConversationHeader } from "./_components/ConversationHeader";
import { ConversationMessages } from "./_components/ConversationMessages";
import { ConversationInput } from "./_components/ConversationInput";
import type {
  ConversationItem,
  Message,
  Participant,
  SelectedFile,
} from "./_components/conversation.types";

interface ConversationClientProps {
  conversationId: string;
}

export function ConversationClient({ conversationId }: ConversationClientProps) {
  const t = useTranslations("Chat");
  const { data: session } = useSession();
  const { checkIsOnline } = usePresence();

  useConversationSocket(conversationId);

  const activeMessages = useChatStore((state) => state.activeMessages);
  const setActiveMessages = useChatStore((state) => state.setActiveMessages);
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
  const addActiveMessage = useChatStore((state) => state.addActiveMessage);

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMarkedMsgIdRef = useRef<string | null>(null);
  const selectedFilesRef = useRef(selectedFiles);

  const currentUserId = session?.user?.id;

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  const markAsSeen = useCallback(async () => {
    if (!conversationId) return;
    try {
      await fetch(`/nest/chat/conversations/${conversationId}/seen`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
  }, [conversationId]);

  // Track active conversation
  useEffect(() => {
    setActiveConversationId(conversationId);
    return () => {
      setActiveConversationId(null);
    };
  }, [conversationId, setActiveConversationId]);

  // Fetch conversation data and history
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [convRes, msgRes] = await Promise.all([
          fetch(`/nest/chat/conversations/${conversationId}`, {
            credentials: "include",
          }),
          fetch(`/nest/chat/conversations/${conversationId}/messages`, {
            credentials: "include",
          }),
        ]);

        if (!convRes.ok) {
          throw new Error(t("loadError"));
        }

        const convData: ConversationItem = await convRes.json();

        let resolvedParticipant = convData.participant ?? null;
        if (!resolvedParticipant && convData.user1 && convData.user2) {
          resolvedParticipant =
            convData.user1.id === currentUserId ? convData.user2 : convData.user1;
        }

        let rawMessages: Message[] = [];
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          rawMessages = msgData.messages || [];
        }

        if (!resolvedParticipant && currentUserId && rawMessages.length > 0) {
          const otherMsg = rawMessages.find((m) => m.senderId !== currentUserId);
          if (otherMsg?.sender) {
            resolvedParticipant = otherMsg.sender;
          }
        }

        if (!cancelled) {
          if (resolvedParticipant) {
            setParticipant(resolvedParticipant);
          }
          setActiveMessages([...rawMessages].reverse());
          setLoading(false);
          setTimeout(() => scrollToBottom(false), 50);
        }

        await markAsSeen();
      } catch (err: unknown) {
        if (!cancelled) {
          setError((err as Error).message || t("loadError"));
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [conversationId, currentUserId, markAsSeen, scrollToBottom, setActiveMessages, t]);

  // Auto scroll on new messages
  useEffect(() => {
    if (!loading && activeMessages.length > 0) {
      scrollToBottom(true);
    }
  }, [activeMessages.length, loading, scrollToBottom]);

  // Notify seen when receiving new incoming message
  useEffect(() => {
    if (!currentUserId || activeMessages.length === 0) return;

    const lastMsg = activeMessages[activeMessages.length - 1];
    if (
      lastMsg.senderId !== currentUserId &&
      !lastMsg.isSeen &&
      lastMarkedMsgIdRef.current !== lastMsg.id
    ) {
      lastMarkedMsgIdRef.current = lastMsg.id;
      markAsSeen();
    }
  }, [activeMessages, currentUserId, markAsSeen]);

  // Keep ref up to date for unmount cleanup
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
    if ((!content && !hasFiles) || !participant || isSending) return;

    setIsSending(true);

    try {
      const files = selectedFiles.map((item) => item.file);

      const createdMessage = await chatService.sendMessage({
        receiverId: participant.id,
        content: content || undefined,
        files,
      });

      addActiveMessage(createdMessage);

      selectedFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setSelectedFiles([]);
      setInputValue("");
      scrollToBottom(true);
    } catch (err: unknown) {
      toast.error((err as Error)?.message || t("sendError"));
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const isParticipantOnline = participant ? checkIsOnline(participant.id) : false;
  const canSend = Boolean((inputValue.trim() || selectedFiles.length > 0) && participant);

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col p-3 sm:p-6">
      <ConversationHeader
        participant={participant}
        isOnline={isParticipantOnline}
      />
      <ConversationMessages
        loading={loading}
        error={error}
        messages={activeMessages}
        currentUserId={currentUserId}
        messagesEndRef={messagesEndRef}
      />
      <ConversationInput
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
    </div>
  );
}
