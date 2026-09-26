"use client";

import { StartMessageButton } from "@/components/chat/StartMessageButton";
import { Search, Users, XCircle } from "@/components/icons";
import { getInitials } from "@/lib/utils/user-utils";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// Types
type FriendUser = {
  id: string;
  name: string | null;
  pseudo: string | null;
  image: string | null;
};

type Friendship = {
  id: string;
  status: "ACCEPTED";
  requesterId: string;
  addresseeId: string;
  createdAt: string;
  updatedAt: string;
  acceptedAt: string | null;
  requester: FriendUser;
  addressee: FriendUser;
  friend?: FriendUser;
};

type Page<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number };
};

const FRIEND_API = {
  me: () => `/nest/user/me`,
  list: (page: number, limit: number, search: string) => {
    const params = new URLSearchParams({
      status: "ACCEPTED",
      page: String(page),
      limit: String(limit),
    });
    if (search.trim()) params.set("search", search.trim());
    return `/nest/friend?${params.toString()}`;
  },
  remove: (id: string) => `/nest/friend/${id}/remove`,
} as const;

const PAGE_SIZE = 12;

export function FriendsListClient() {
  const t = useTranslations("FriendsList");

  const [friends, setFriends] = useState<Friendship[]>([]);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [meta, setMeta] = useState<Page<Friendship>["meta"]>({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    pages: 1,
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Debounce search input so we don't hammer the API on every keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

  // Resolve the viewer once so we can pick the "other" side reliably.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(FRIEND_API.me(), {
          credentials: "include",
          cache: "no-store",
        });
        if (cancelled || !res.ok) return;
        const me: { id: string } = await res.json();
        if (!cancelled) setViewerId(me.id ?? null);
      } catch {
        /* leave null — fall back to requester */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load page whenever page or debounced search changes.
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(false);

    (async () => {
      try {
        const res = await fetch(FRIEND_API.list(page, PAGE_SIZE, debouncedSearch), {
          credentials: "include",
          cache: "no-store",
        });
        if (cancelled) return;
        if (!res.ok) {
          setLoadError(true);
          return;
        }
        const json: Page<Friendship> = await res.json();
        setFriends(json.data);
        setMeta(json.meta);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch]);

  const handleRemove = useCallback(
    async (id: string) => {
      setPendingId(id);
      setActionError(null);

      const prev = friends;
      const prevMeta = meta;

      setFriends((list) => list.filter((f) => f.id !== id));
      setMeta((m) => ({ ...m, total: Math.max(0, m.total - 1) }));

      try {
        const res = await fetch(FRIEND_API.remove(id), {
          method: "PATCH",
          credentials: "include",
        });
        if (!res.ok) {
          setFriends(prev);
          setMeta(prevMeta);
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
        setFriends(prev);
        setMeta(prevMeta);
        setActionError(t("actionError"));
      } finally {
        setPendingId(null);
      }
    },
    [friends, meta, t],
  );

  const showEmpty = !isLoading && !loadError && friends.length === 0;
  const showList = !isLoading && !loadError && friends.length > 0;

  return (
    <div className="mt-8">
      {/* Search */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-white dark:placeholder:text-zinc-500"
          />
        </div>
        <span className="hidden shrink-0 text-sm text-zinc-500 sm:block dark:text-zinc-400">
          {t("count", { count: meta.total })}
        </span>
      </div>

      {actionError && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          {actionError}
        </div>
      )}

      {isLoading && <SkeletonGrid />}

      {!isLoading && loadError && (
        <EmptyCard title={t("loadError")} description={t("loadErrorHint")} />
      )}

      {showEmpty && (
        <EmptyCard
          title={debouncedSearch ? t("empty.searchTitle") : t("empty.title")}
          description={
            debouncedSearch ? t("empty.searchDescription") : t("empty.description")
          }
        />
      )}

      {showList && (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {friends.map((friendship) => {
            const primary = pickOther(friendship, viewerId);
            const displayName =
              primary.name?.trim() || primary.pseudo?.trim() || t("unnamed");
            const isBusy = pendingId === friendship.id;

            return (
              <li
                key={friendship.id}
                className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 shadow-xs backdrop-blur-xl transition hover:border-violet-300/60 dark:border-zinc-800 dark:bg-zinc-900/40 dark:shadow-none dark:hover:border-violet-500/40"
              >
                <div className="flex items-center gap-3">
                  <Link
                    href={`/profile/${primary.id}`}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 outline-none ring-violet-500/40 transition hover:bg-violet-50/60 focus-visible:ring-2 dark:hover:bg-violet-500/5"
                  >
                    <Avatar user={primary} fallback={displayName} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                        {displayName}
                      </p>
                      {primary.pseudo && (
                        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                          @{primary.pseudo}
                        </p>
                      )}
                    </div>
                  </Link>

                  <StartMessageButton
                    user={primary}
                    variant="icon"
                    disabled={isBusy}
                  />

                  <button
                    type="button"
                    onClick={() => handleRemove(friendship.id)}
                    disabled={isBusy}
                    aria-label={t("actions.remove")}
                    title={t("actions.remove")}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showList && meta.pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800/70"
          >
            {t("pagination.previous")}
          </button>

          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {t("pagination.page", { page: meta.page, pages: meta.pages })}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
            disabled={page >= meta.pages || isLoading}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800/70"
          >
            {t("pagination.next")}
          </button>
        </div>
      )}
    </div>
  );
}

// Returns the other participant in the friendship
function pickOther(friendship: Friendship, viewerId: string | null): FriendUser {
  if (friendship.friend) return friendship.friend;
  if (viewerId) {
    if (friendship.requesterId === viewerId) return friendship.addressee;
    if (friendship.addresseeId === viewerId) return friendship.requester;
  }
  return friendship.requester;
}

// Subcomponents
function Avatar({ user, fallback }: { user: FriendUser; fallback: string }) {
  const [failed, setFailed] = useState(false);

  if (user.image && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.image}
        alt={fallback}
        className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-zinc-200/80 dark:ring-zinc-800"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-600 ring-1 ring-zinc-200/80 dark:bg-violet-500/15 dark:text-violet-400 dark:ring-zinc-800">
      {getInitials(fallback)}
    </div>
  );
}

function EmptyCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-10 text-center shadow-xs backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/40 dark:shadow-none">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-violet-600 ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:text-violet-400/70 dark:ring-zinc-800">
        <Users className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/40"
        >
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-3 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            </div>
            <div className="h-9 w-9 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </li>
      ))}
    </ul>
  );
}