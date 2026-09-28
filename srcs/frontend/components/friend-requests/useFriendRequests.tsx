"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FRIEND_API, type Friendship, type Page } from "./types";

export function useFriendRequests() {
  const t = useTranslations("FriendRequests");

  const [incoming, setIncoming] = useState<Friendship[]>([]);
  const [outgoing, setOutgoing] = useState<Friendship[]>([]);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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

        if (meRes.ok) {
          try {
            const me: { id: string } = await meRes.json();
            if (!cancelled) setViewerId(me.id ?? null);
          } catch {
            /* ignore */
          }
        }

        const [inJson, outJson]: [Page<Friendship>, Page<Friendship>] =
          await Promise.all([inRes.json(), outRes.json()]);

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

  const runAction = useCallback(
    async (
      id: string,
      kind: "accept" | "reject" | "cancel",
      request: () => Promise<Response>,
    ) => {
      setPendingId(id);
      setActionError(null);

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

  return {
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
  };
}