"use client";

import { useState } from "react";
import { getInitials } from "@/lib/utils/user-utils";
import type { FriendUser } from "./types";

export function FriendRequestAvatar({
  user,
  fallback,
}: {
  user: FriendUser;
  fallback: string;
}) {
  const [failed, setFailed] = useState(false);

  if (user.image && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.image}
        alt={fallback}
        className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-zinc-200/80 dark:ring-zinc-800"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-600 ring-1 ring-zinc-200/80 dark:bg-violet-500/15 dark:text-violet-400 dark:ring-zinc-800">
      {getInitials(fallback)}
    </div>
  );
}