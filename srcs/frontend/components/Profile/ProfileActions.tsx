// components/Profile/ProfileActions.tsx
"use client";

import { useState } from "react";
import { Plus, Pencil, MoreHorizontal, UserPlus, MessageCircle } from "lucide-react";

interface ProfileActionsProps {
  username: string;
  isOwner: boolean;
  isFollowing?: boolean;
}

export function ProfileActions({ isOwner, isFollowing }: ProfileActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {isOwner ? (
        <>
          <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-primary/5">
            <Pencil className="h-4 w-4" />
            Modifier le profil
          </button>
        </>
      ) : (
        <>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
            <UserPlus className="h-4 w-4" />
            {isFollowing ? "Abonné(e)" : "Suivre"}
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-primary/5">
            <MessageCircle className="h-4 w-4" />
            Message
          </button>
        </>
      )}
    </div>
  );
}
