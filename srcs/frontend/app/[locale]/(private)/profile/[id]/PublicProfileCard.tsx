"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getInitials } from "@/lib/utils/user-utils";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type PublicUser = {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
  createdAt: string;
};

type MeUser = {
  id: string;
  name: string | null;
  email?: string | null;
  image: string | null;
  role?: string | null;
};

type FriendshipStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "BLOCKED"
  | "CANCELLED";

type Friendship = {
  id: string;
  status: FriendshipStatus;
  requesterId: string;
  addresseeId: string;
  blockedById: string | null;
  acceptedAt: string | null;
  requester: { id: string; name: string | null; pseudo: string | null; image: string | null };
  addressee: { id: string; name: string | null; pseudo: string | null; image: string | null };
};

const FRIEND_API = {
  getWith: (userId: string) => `/nest/friend/with/${encodeURIComponent(userId)}`,
  send: () => `/nest/friend`,
  accept: (id: string) => `/nest/friend/${id}/accept`,
  reject: (id: string) => `/nest/friend/${id}/reject`,
  cancel: (id: string) => `/nest/friend/${id}/cancel`,
  remove: (id: string) => `/nest/friend/${id}/remove`,
  block: () => `/nest/friend/block`,
} as const;

const USER_API = {
  me: () => `/nest/user/me`,
  byId: (userId: string) => `/nest/user/${encodeURIComponent(userId)}`,
} as const;

export function PublicProfileCard({
  userId,
  currentUserId: currentUserIdProp,
}: {
  userId: string;
  currentUserId?: string | null;
}) {
  const t = useTranslations("PublicProfile");

  const [user, setUser] = useState<PublicUser | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(
    currentUserIdProp ?? null,
  );
  const [viewerResolved, setViewerResolved] = useState(
    currentUserIdProp !== undefined,
  );
  const [friendship, setFriendship] = useState<Friendship | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "add" | "remove" | "accept" | "reject" | "cancel" | "block" | null
  >(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isSelf = !!viewerId && viewerId === userId;
  const canInteract = !!viewerId && !isSelf;

  // EFFECT 1 — resolve viewer from /me
  useEffect(() => {
    if (currentUserIdProp !== undefined) {
      setViewerId(currentUserIdProp ?? null);
      setViewerResolved(true);
      return;
    }

    let cancelled = false;
    setViewerResolved(false);

    (async () => {
      try {
        const res = await fetch(USER_API.me(), {
          credentials: "include",
          cache: "no-store",
        });
        if (cancelled) return;
        if (res.ok) {
          const me: MeUser = await res.json();
          setViewerId(me.id ?? null);
        } else {
          setViewerId(null);
        }
      } catch {
        if (!cancelled) setViewerId(null);
      } finally {
        if (!cancelled) setViewerResolved(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUserIdProp]);

  // EFFECT 2 — load target user
  useEffect(() => {
    let cancelled = false;
    setNotFound(false);
    setIsLoading(true);

    (async () => {
      try {
        const res = await fetch(USER_API.byId(userId), {
          credentials: "include",
          cache: "no-store",
        });
        if (cancelled) return;
        if (res.status === 404 || !res.ok) {
          setNotFound(true);
          return;
        }
        const data: PublicUser = await res.json();
        setUser(data);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // EFFECT 3 — load friendship
  useEffect(() => {
    setActionError(null);
    setFriendship(null);

    if (!viewerResolved || !canInteract) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(FRIEND_API.getWith(userId), {
          credentials: "include",
          cache: "no-store",
        });
        if (cancelled) return;
        if (res.ok) {
          const data: Friendship = await res.json();
          setFriendship(data);
        } else if (res.status !== 404) {
          console.warn("Failed to load friendship", res.status);
        }
      } catch {
        /* leave null */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, canInteract, viewerResolved]);

  const runAction = useCallback(
    async (
      kind: NonNullable<typeof pendingAction>,
      optimistic: () => void,
      rollback: () => void,
      request: () => Promise<Response>,
    ) => {
      setPendingAction(kind);
      setActionError(null);
      optimistic();

      try {
        const res = await request();
        if (!res.ok) {
          let message = t("actionError");
          try {
            const body = await res.json();
            if (body?.message)
              message = Array.isArray(body.message) ? body.message[0] : body.message;
          } catch {
            /* ignore */
          }
          rollback();
          setActionError(message);
          return;
        }

        try {
          const updated: Friendship = await res.json();
          if (updated?.id) setFriendship(updated);
        } catch {
          /* empty body is fine */
        }
      } catch {
        rollback();
        setActionError(t("actionError"));
      } finally {
        setPendingAction(null);
      }
    },
    [t],
  );

  const handleAdd = useCallback(() => {
    if (!viewerId) return;
    runAction(
      "add",
      () =>
        setFriendship({
          id: "optimistic",
          status: "PENDING",
          acceptedAt: null,
          requesterId: viewerId,
          addresseeId: userId,
          blockedById: null,
          requester: { id: viewerId, name: null, pseudo: null, image: null },
          addressee: { id: userId, name: null, pseudo: null, image: null },
        }),
      () => setFriendship(null),
      () =>
        fetch(FRIEND_API.send(), {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ addresseeId: userId }),
        }),
    );
  }, [runAction, viewerId, userId]);

  const handleCancel = useCallback(() => {
    if (!friendship || friendship.id === "optimistic") return;
    runAction(
      "cancel",
      () => setFriendship(null),
      () => setFriendship(friendship),
      () =>
        fetch(FRIEND_API.cancel(friendship.id), {
          method: "PATCH",
          credentials: "include",
        }),
    );
  }, [friendship, runAction]);

  const handleAccept = useCallback(() => {
    if (!friendship) return;
    runAction(
      "accept",
      () => setFriendship({ ...friendship, status: "ACCEPTED" }),
      () => setFriendship(friendship),
      () =>
        fetch(FRIEND_API.accept(friendship.id), {
          method: "PATCH",
          credentials: "include",
        }),
    );
  }, [friendship, runAction]);

  const handleReject = useCallback(() => {
    if (!friendship) return;
    runAction(
      "reject",
      () => setFriendship(null),
      () => setFriendship(friendship),
      () =>
        fetch(FRIEND_API.reject(friendship.id), {
          method: "PATCH",
          credentials: "include",
        }),
    );
  }, [friendship, runAction]);

  const handleRemove = useCallback(() => {
    if (!friendship) return;
    runAction(
      "remove",
      () => setFriendship(null),
      () => setFriendship(friendship),
      () =>
        fetch(FRIEND_API.remove(friendship.id), {
          method: "PATCH",
          credentials: "include",
        }),
    );
  }, [friendship, runAction]);

  const friendBadge = useMemo(() => {
    if (isSelf) return null;
    if (!friendship) return null;

    switch (friendship.status) {
      case "ACCEPTED":
        return { label: t("friendStatus.friends"), tone: "success" as const };
      case "PENDING":
        return friendship.requesterId === viewerId
          ? { label: t("friendStatus.requestSent"), tone: "pending" as const }
          : { label: t("friendStatus.requestReceived"), tone: "pending" as const };
      case "BLOCKED":
        return { label: t("friendStatus.blocked"), tone: "danger" as const };
      case "REJECTED":
      case "CANCELLED":
        return null;
      default:
        return null;
    }
  }, [friendship, isSelf, viewerId, t]);

  // ── Loading ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/40 dark:shadow-none">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-40 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-4 w-56 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ───────────────────────────────────────────────
  if (notFound || !user) {
    return (
      <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-10 text-center backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/40">
        <p className="text-sm font-medium text-zinc-900 dark:text-white">
          {t("notFound")}
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {t("notFoundHint")}
        </p>
      </div>
    );
  }

  const displayName = user.name?.trim() || t("unnamed");
  const initials = getInitials(displayName);
  const joinedAt = formatDate(user.createdAt);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/40 dark:shadow-none">
      {/* Subtle top hairline — violet in both themes, but calmer in light */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent dark:via-violet-500/50"
      />

      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <Avatar src={user.image} initials={initials} alt={displayName} />

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-bold text-zinc-900 dark:text-white">
            {displayName}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {user.role && (
              <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-400">
                {user.role}
              </span>
            )}
            {friendBadge && <FriendBadge tone={friendBadge.tone} label={friendBadge.label} />}
          </div>
        </div>

        {canInteract && (
          <FriendActions
            t={t}
            friendship={friendship}
            currentUserId={viewerId!}
            pendingAction={pendingAction}
            onAdd={handleAdd}
            onCancel={handleCancel}
            onAccept={handleAccept}
            onReject={handleReject}
            onRemove={handleRemove}
          />
        )}
      </div>

      {actionError && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          {actionError}
        </p>
      )}

      <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-zinc-200/80 pt-5 sm:grid-cols-2 dark:border-zinc-800">
        <MetaRow label={t("idLabel")} value={user.id} mono />
        <MetaRow label={t("joinedLabel")} value={joinedAt} />
      </dl>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Friend badge — explicit light/dark colors, no CSS tokens
// ─────────────────────────────────────────────────────────────
function FriendBadge({
  tone,
  label,
}: {
  tone: "success" | "pending" | "danger";
  label: string;
}) {
  const styles: Record<typeof tone, string> = {
    success:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    pending:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    danger:
      "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  } as const;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[tone]}`}
    >
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// FriendActions — violet / zinc, works in both themes
// ─────────────────────────────────────────────────────────────
function FriendActions({
  t,
  friendship,
  currentUserId,
  pendingAction,
  onAdd,
  onCancel,
  onAccept,
  onReject,
  onRemove,
}: {
  t: ReturnType<typeof useTranslations>;
  friendship: Friendship | null;
  currentUserId: string;
  pendingAction: "add" | "remove" | "accept" | "reject" | "cancel" | "block" | null;
  onAdd: () => void;
  onCancel: () => void;
  onAccept: () => void;
  onReject: () => void;
  onRemove: () => void;
}) {
  const busy = pendingAction !== null;

  const primary =
    "inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-500 active:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60";
  const secondary =
    "inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800/70";
  const danger =
    "inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20";

  if (!friendship) {
    return (
      <button type="button" onClick={onAdd} disabled={busy} className={`${primary} shrink-0`}>
        {pendingAction === "add" ? t("actions.adding") : t("actions.addFriend")}
      </button>
    );
  }

  if (friendship.status === "BLOCKED") {
    return (
      <span className="shrink-0 rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-400">
        {t("actions.blocked")}
      </span>
    );
  }

  if (!friendship.acceptedAt && friendship.requesterId === currentUserId) {
    return (
      <button type="button" onClick={onCancel} disabled={busy} className={`${secondary} shrink-0`}>
        {pendingAction === "cancel" ? t("actions.cancelling") : t("actions.cancelRequest")}
      </button>
    );
  }

  if (friendship.status === "PENDING" && friendship.addresseeId === currentUserId) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={onAccept} disabled={busy} className={primary}>
          {pendingAction === "accept" ? t("actions.accepting") : t("actions.accept")}
        </button>
        <button type="button" onClick={onReject} disabled={busy} className={secondary}>
          {pendingAction === "reject" ? t("actions.rejecting") : t("actions.reject")}
        </button>
      </div>
    );
  }

  if (friendship.status === "ACCEPTED") {
    return (
      <button type="button" onClick={onRemove} disabled={busy} className={`${danger} shrink-0`}>
        {pendingAction === "remove" ? t("actions.removing") : t("actions.removeFriend")}
      </button>
    );
  }

  return (
    <button type="button" onClick={onAdd} disabled={busy} className={`${primary} shrink-0`}>
      {pendingAction === "add" ? t("actions.adding") : t("actions.addFriend")}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────
function Avatar({ src, initials, alt }: { src: string | null; initials: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className="h-20 w-20 shrink-0 rounded-full object-cover ring-1 ring-zinc-200/80 dark:ring-zinc-800"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-violet-100 text-lg font-semibold text-violet-600 ring-1 ring-zinc-200/80 dark:bg-violet-500/15 dark:text-violet-400 dark:ring-zinc-800">
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MetaRow
// ─────────────────────────────────────────────────────────────
function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd
        className={`mt-1 truncate text-sm text-zinc-900 dark:text-white ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}