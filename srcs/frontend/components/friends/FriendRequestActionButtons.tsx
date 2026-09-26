"use client";

import { useState } from "react";
import {
  AcceptFriendRequestButton,
  DeclineFriendRequestButton,
  RemoveFriendButton,
  SendFriendRequestButton,
} from "./index";

interface FriendRequestActionButtonsProps {
  requestId: string;
  userId: string;
  onSuccess?: () => void;
}

export function FriendRequestActionButtons({
  requestId,
  userId,
  onSuccess,
}: FriendRequestActionButtonsProps) {
  const [action, setAction] = useState<"accepted" | "declined" | null>(null);

  if (action === "accepted") {
    return (
      <RemoveFriendButton
        friendshipId={requestId}
        onSuccess={onSuccess}
      />

    );
  }

  if (action === "declined") {
    return (
      <SendFriendRequestButton
        addresseeId={userId}
        hasPendingOutgoing={false}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <AcceptFriendRequestButton
        requestId={requestId}
        onSuccess={() => {
          setAction("accepted");
          onSuccess?.();
        }}
      />

      <DeclineFriendRequestButton
        requestId={requestId}
        onSuccess={() => {
          setAction("declined");
          onSuccess?.();
        }}
      />
    </div>
  );
}
