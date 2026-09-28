"use client";

import { useMemo, useState } from "react";
import { useFriendRequests } from "@/components/friend-requests/useFriendRequests";
import { FriendRequestTabs } from "@/components/friend-requests/FriendRequestTabs";
import { FriendRequestSearch } from "@/components/friend-requests/FriendRequestSearch";
import { FriendRequestList } from "@/components/friend-requests/FriendRequestList";
import { FriendRequestEmpty } from "@/components/friend-requests/FriendRequestEmpty";
import { FriendRequestSkeleton } from "@/components/friend-requests/FriendRequestSkeleton";
import { pickOther, type Tab } from "@/components/friend-requests/types";

export function FriendRequestsClient() {
  const {
    incoming,
    outgoing,
    viewerId,
    isLoading,
    loadError,
    pendingId,
    actionError,
    handleAccept,
    handleReject,
    handleCancel,
  } = useFriendRequests();

  const [tab, setTab] = useState<Tab>("incoming");
  const [query, setQuery] = useState("");

  const sourceList = tab === "incoming" ? incoming : outgoing;

  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sourceList;

    return sourceList.filter((f) => {
      const other = pickOther(f, viewerId, tab);
      const haystack = `${other.name ?? ""} ${other.pseudo ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [sourceList, query, viewerId, tab]);

  const isSearching = query.trim().length > 0;

  return (
    <div className="mt-8">
      {/* Tabs + search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FriendRequestTabs
          value={tab}
          onChange={setTab}
          incomingCount={incoming.length}
          outgoingCount={outgoing.length}
        />
        <FriendRequestSearch value={query} onChange={setQuery} />
      </div>

      {actionError && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          {actionError}
        </div>
      )}

      {isLoading && <FriendRequestSkeleton />}

      {!isLoading && loadError && (
        <FriendRequestEmpty tab={tab} isSearching={false} variant="error" />
      )}

      {!isLoading && !loadError && filteredList.length === 0 && (
        <FriendRequestEmpty tab={tab} isSearching={isSearching} />
      )}

      {!isLoading && !loadError && filteredList.length > 0 && (
        <FriendRequestList
          items={filteredList}
          viewerId={viewerId}
          tab={tab}
          pendingId={pendingId}
          onAccept={handleAccept}
          onReject={handleReject}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}