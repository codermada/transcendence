"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Search } from "@/components/icons";
import { StartMessageButton } from "@/components/chat/StartMessageButton";
import { getInitials } from "@/lib/utils/user-utils";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type FriendUser = {
  id: string;
  name: string | null;
  pseudo: string | null;
  image: string | null;
};

type Friendship = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "BLOCKED" | "CANCELLED";
  requesterId: string;
  addresseeId: string;
  message: string | null;
  createdAt: string;
  requester: FriendUser;
  addressee: FriendUser;
};

type Page<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number };
};

type Tab = "incoming" | "outgoing";

const FRIEND_API = {
  me: () => `/nest/user/me`,
  incoming: (page = 1, limit = 50) =>
    `/nest/friend/requests/incoming?page=${page}&limit=${limit}`,
  outgoing: (page = 1, limit = 50) =>
    `/nest/friend/requests/outgoing?page=${page}&limit=${limit}`,
  accept: (id: string) => `/nest/friend/${id}/accept`,
  reject: (id: string) => `/nest/friend/${id}/reject`,
  cancel: (id: string) => `/nest/friend/${id}/cancel`,
} as const;

export function FriendRequestsClient() {
  const t = useTranslations("FriendRequests");

  // ── State ───────────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>("incoming");
  const [incoming, setIncoming] = useState<Friendship[]>([]);
  const [outgoing, setOutgoing] = useState<Friendship[]>([]);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // ── Initial load (viewer + both lists in parallel) ──────────
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(false);

    (async () => {
      try {
        const [meRes, inRes, outRes] = await Promise.all([
          fetch(FRIEND_API.me(), { credentials: "include", cache: "no-store" }),
          fetch(FRIEND_API.incoming(), { credentials: "include", cache: "no-store" }),
          fetch(FRIEND_API.outgoing(), { credentials: "include", cache: "no-store" }),
        ]);

        if (cancelled) return;

        if (!inRes.ok || !outRes.ok) {
          setLoadError(true);
          return;
        }

        // /me is best-effort: if it fails we still show the lists,
        // we just can't tell which side is "the other user" as reliably.
        if (meRes.ok) {
          try {
            const me: { id: string } = await meRes.json();
            if (!cancelled) setViewerId(me.id ?? null);
          } catch {
            /* ignore */
          }
        }

        const [inJson, outJson]: [Page<Friendship>, Page<Friendship>] = await Promise.all([
          inRes.json(),
          outRes.json(),
        ]);

        if (cancelled) return;
        setIncoming(inJson.data);
        setOutgoing(outJson.data);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Action runner (optimistic removal + rollback) ───────────
  const runAction = useCallback(
    async (
      id: string,
      kind: "accept" | "reject" | "cancel",
      request: () => Promise<Response>,
    ) => {
      setPendingId(id);
      setActionError(null);

      // Snapshot both lists for rollback.
      const prevIncoming = incoming;
      const prevOutgoing = outgoing;

      if (kind === "cancel") {
        setOutgoing((list) => list.filter((f) => f.id !== id));
      } else {
        setIncoming((list) => list.filter((f) => f.id !== id));
      }

      try {
        const res = await request();
        if (!res.ok) {
          setIncoming(prevIncoming);
          setOutgoing(prevOutgoing);

          let message = t("actionError");
          try {
            const body = await res.json();
            if (body?.message)
              message = Array.isArray(body.message) ? body.message[0] : body.message;
          } catch {
            /* ignore */
          }
          setActionError(message);
        }
      } catch {
        setIncoming(prevIncoming);
        setOutgoing(prevOutgoing);
        setActionError(t("actionError"));
      } finally {
        setPendingId(null);
      }
    },
    [incoming, outgoing, t],
  );

  const handleAccept = useCallback(
    (id: string) =>
      runAction(id, "accept", () =>
        fetch(FRIEND_API.accept(id), { method: "PATCH", credentials: "include" }),
      ),
    [runAction],
  );
  const handleReject = useCallback(
    (id: string) =>
      runAction(id, "reject", () =>
        fetch(FRIEND_API.reject(id), { method: "PATCH", credentials: "include" }),
      ),
    [runAction],
  );
  const handleCancel = useCallback(
    (id: string) =>
      runAction(id, "cancel", () =>
        fetch(FRIEND_API.cancel(id), { method: "PATCH", credentials: "include" }),
      ),
    [runAction],
  );

  // ── Derived ─────────────────────────────────────────────────
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

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="mt-8">
      {/* Tabs + search on the same row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label={t("tabsAriaLabel")}
          className="inline-flex rounded-xl border border-zinc-200/80 bg-white/70 p-1 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/40"
        >
          <TabButton
            active={tab === "incoming"}
            onClick={() => setTab("incoming")}
            count={incoming.length}
          >
            {t("tabs.incoming")}
          </TabButton>
          <TabButton
            active={tab === "outgoing"}
            onClick={() => setTab("outgoing")}
            count={outgoing.length}
          >
            {t("tabs.outgoing")}
          </TabButton>
        </div>

        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-white dark:placeholder:text-zinc-500"
          />
        </div>
      </div>

      {actionError && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          {actionError}
        </div>
      )}

      {/* Loading */}
      {isLoading && <SkeletonList />}

      {/* Load error */}
      {!isLoading && loadError && (
        <Card>
          <EmptyIcon />
          <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
            {t("loadError")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
            {t("loadErrorHint")}
          </p>
        </Card>
      )}

      {/* Empty (either no requests, or no match for the query) */}
      {!isLoading && !loadError && filteredList.length === 0 && (
        <Card>
          <EmptyIcon />
          <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
            {query.trim()
              ? t("empty.searchTitle")
              : tab === "incoming"
                ? t("empty.incomingTitle")
                : t("empty.outgoingTitle")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
            {query.trim()
              ? t("empty.searchDescription")
              : tab === "incoming"
                ? t("empty.incomingDescription")
                : t("empty.outgoingDescription")}
          </p>
        </Card>
      )}

      {/* List */}
      {!isLoading && !loadError && filteredList.length > 0 && (
        <ul className="space-y-3">
          {filteredList.map((friendship) => {
            const other = pickOther(friendship, viewerId, tab);
            const isBusy = pendingId === friendship.id;
            const displayName =
              other.name?.trim() || other.pseudo?.trim() || t("unnamed");

            return (
              <li
                key={friendship.id}
                className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 shadow-xs backdrop-blur-xl transition hover:border-violet-300/60 dark:border-zinc-800 dark:bg-zinc-900/40 dark:shadow-none dark:hover:border-violet-500/40"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    href={`/profile/${other.id}`}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 outline-none ring-violet-500/40 transition hover:bg-violet-50/60 focus-visible:ring-2 dark:hover:bg-violet-500/5"
                  >
                    <Avatar user={other} fallback={displayName} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                        {displayName}
                      </p>
                      {other.pseudo && (
                        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                          @{other.pseudo}
                        </p>
                      )}
                    </div>
                  </Link>

                  <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                    <StartMessageButton user={other} disabled={isBusy} />
                    {tab === "incoming" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAccept(friendship.id)}
                          disabled={isBusy}
                          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-500 active:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isBusy ? t("actions.accepting") : t("actions.accept")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(friendship.id)}
                          disabled={isBusy}
                          className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800/70"
                        >
                          {isBusy ? t("actions.rejecting") : t("actions.reject")}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCancel(friendship.id)}
                        disabled={isBusy}
                        className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800/70"
                      >
                        {isBusy ? t("actions.cancelling") : t("actions.cancel")}
                      </button>
                    )}
                  </div>
                </div>

                {friendship.message && (
                  <p className="mt-3 border-t border-zinc-200/80 pt-3 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    “{friendship.message}”
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
/**
 * Picks the "other side" of a friendship, i.e. the user who is NOT me.
 * Falls back to the tab semantics when `viewerId` is unknown.
 */
function pickOther(
  friendship: Friendship,
  viewerId: string | null,
  tab: Tab,
): FriendUser {
  if (viewerId) {
    if (friendship.requesterId === viewerId) return friendship.addressee;
    if (friendship.addresseeId === viewerId) return friendship.requester;
  }
  // Fallback — the incoming tab always shows the requester, the outgoing
  // tab always shows the addressee, because that matches the API contract.
  return tab === "incoming" ? friendship.requester : friendship.addressee;
}

// ─────────────────────────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────────────────────────
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-10 text-center shadow-xs backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/40 dark:shadow-none">
      {children}
    </div>
  );
}

function EmptyIcon() {
  return (
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-violet-600 ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:text-violet-400/70 dark:ring-zinc-800">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7"
        aria-hidden
      >
        <path d="M3 8l9 6 9-6" />
        <rect x="3" y="5" width="18" height="14" rx="2" />
      </svg>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      }`}
    >
      {children}
      <span
        className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium ${
          active
            ? "bg-white/20 text-white"
            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function Avatar({ user, fallback }: { user: FriendUser; fallback: string }) {
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

function SkeletonList() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/40"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-3 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            </div>
            <div className="h-9 w-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </li>
      ))}
    </ul>
  );
}