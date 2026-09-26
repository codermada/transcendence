"use client";

import { useState } from "react";
import {
  SendFriendRequestButton,
  CancelFriendRequestButton,
} from "./index";

interface FriendRequestButtonProps {
  userId: string;
  requestId?: string;
  hasPendingOutgoing: boolean;
  onSuccess?: () => void;
}

export function SendCancelFriendRequestButton({
  userId,
  requestId,
  hasPendingOutgoing,
  onSuccess,
}: FriendRequestButtonProps) {
  const [isPendingOutgoing, setIsPendingOutgoing] =
    useState(hasPendingOutgoing);

  const handleSendSuccess = () => {
    setIsPendingOutgoing(true);
    onSuccess?.();
  };

  const handleCancelSuccess = () => {
    setIsPendingOutgoing(false);
    onSuccess?.();
  };

  if (isPendingOutgoing) {
    if (!requestId) return null;

    return (
      <CancelFriendRequestButton
        requestId={requestId}
        onSuccess={handleCancelSuccess}
      />
    );
  }

  return (
    <SendFriendRequestButton
      addresseeId={userId}
      hasPendingOutgoing={false}
      onSuccess={handleSendSuccess}
    />
  );
}
