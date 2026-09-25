"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Search, ArrowLeft, Loader2, UserPlus, Check, UserCheck, X, UserX } from "@/components/icons";
import { StartMessageButton } from "@/components/chat/StartMessageButton";
import { networkService } from "../../feed/_services/feed/network/NetworkService";
import { toast } from "sonner";

type FriendStatus =
  | "FRIEND"
  | "FRIEND_REQUEST_SENT"
  | "FRIEND_REQUEST_RECEIVED"
  | "NOT_FRIEND";

type SearchUser = {
  id: string;
  name: string;
  image: string | null;
  pseudo?: string | null;
  status: FriendStatus;
  requestId?: string | null;
  friendshipId?: string | null;
};

type SearchResponse = {
  items: SearchUser[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export default function SearchFriendsPage() {
  const t = useTranslations("Friends");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        params.set("page", "1");
        params.set("limit", "20");

        const res = await fetch(`/nest/user/search?${params.toString()}`, {
          credentials: "include",
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Request failed");

        const data: SearchResponse = await res.json();
        setResults(data.items);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(t("searchError"));
      } finally {
        setLoading(false);
      }
    }

    run();
    return () => controller.abort();
  }, [query, t]);

  // Envoyer une demande d'ami
  async function handleAdd(userId: string) {
    setPendingActionId(userId);

    try {
      const res = await fetch("/nest/friend", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresseeId: userId }),
      });

      if (res.ok) {
        const data = await res.json();
        const id = data.id ?? data.requestId;
        setResults((prev) =>
          prev.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  status: "FRIEND_REQUEST_SENT",
                  requestId: id ?? user.requestId,
                  friendshipId: id ?? user.friendshipId,
                }
              : user
          )
        );
        toast.success(t("toasts.addSuccess") || "Demande d'ami envoyée");
      } else {
        throw new Error();
      }
    } catch {
      toast.error(t("toasts.addError") || "Erreur lors de l'envoi de la demande");
    } finally {
      setPendingActionId(null);
    }
  }

  // Accepter une demande d'ami reçue via networkService
  async function handleAcceptRequest(user: SearchUser) {
    const reqId = user.requestId || user.friendshipId;
    if (!reqId) return;

    setPendingActionId(user.id);
    try {
      await networkService.acceptRequest(reqId);
      setResults((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: "FRIEND" } : u))
      );
      toast.success(t("toasts.acceptSuccess") || "Demande d'ami acceptée");
    } catch {
      toast.error(t("toasts.acceptError") || "Impossible d'accepter la demande");
    } finally {
      setPendingActionId(null);
    }
  }

  // Refuser une demande d'ami reçue via networkService
  async function handleDeclineRequest(user: SearchUser) {
    const reqId = user.requestId;
    if (!reqId) return;

    setPendingActionId(user.id);
    try {
      await networkService.declineRequest(reqId);
      setResults((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, status: "NOT_FRIEND", requestId: null, friendshipId: null }
            : u
        )
      );
      toast.success(t("toasts.declineSuccess") || "Demande d'ami refusée");
    } catch {
      toast.error(t("toasts.declineError") || "Impossible de refuser la demande");
    } finally {
      setPendingActionId(null);
    }
  }

  // Supprimer un ami
// Supprimer un ami via networkService
  async function handleRemoveFriend(user: SearchUser) {
    const reqId = user.requestId || user.friendshipId;
    if (!reqId) return;

    setPendingActionId(user.id);
    try {
      await networkService.removeFriend(reqId);
      setResults((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, status: "NOT_FRIEND", requestId: null, friendshipId: null }
            : u
        )
      );
      toast.success(t("toasts.removeSuccess") || "Ami supprimé");
    } catch {
      toast.error(t("toasts.removeError") || "Impossible de supprimer l'ami");
    } finally {
      setPendingActionId(null);
    }
  }
  // Annuler une demande d'ami envoyée
  async function handleCancel(user: SearchUser) {
    const reqId = user.requestId || user.friendshipId;
    setPendingActionId(user.id);

    try {
      const url = reqId
        ? `/nest/friend/${reqId}/cancel`
        : `/nest/friend/cancel-by-user/${user.id}`;

      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setResults((prev) =>
          prev.map((u) =>
            u.id === user.id
              ? { ...u, status: "NOT_FRIEND", requestId: null, friendshipId: null }
              : u
          )
        );
        toast.success(t("toasts.cancelSuccess") || "Demande annulée");
      } else {
        throw new Error();
      }
    } catch {
      toast.error(t("toasts.cancelError") || "Erreur lors de l'annulation");
    } finally {
      setPendingActionId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3 border-b border-zinc-200/80 pb-5 dark:border-zinc-800">
        <Link
          href="/friends"
          className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label={t("back")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {t("findFriends")}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Search input */}
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-4 text-sm text-zinc-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
        />
      </div>

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-zinc-500">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      {!loading && error && (
        <p className="py-12 text-center text-sm text-red-500">{error}</p>
      )}

      {!loading && !error && results.length === 0 && (
        <p className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {query.trim() ? t("noResults") : t("startTyping")}
        </p>
      )}

      {!loading && !error && results.length > 0 && (
        <ul className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {results.map((u) => {
            const isLoading = pendingActionId === u.id;

            return (
              <li
                key={u.id}
                className="flex items-center justify-between gap-3 bg-white px-5 py-3 dark:bg-zinc-900"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={u.image ?? "/nest/uploads/default-avatar.png"}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                      {u.name}
                    </span>
                    {u.pseudo && (
                      <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                        @{u.pseudo}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <StartMessageButton user={u} disabled={isLoading} />

                  {/* CAS 1: Déjà amis -> Badge + Bouton Supprimer */}
                  {u.status === "FRIEND" && (
                    <>
                      <span className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        <UserCheck className="h-3.5 w-3.5" />
                        {t("friends") || "Amis"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFriend(u)}
                        disabled={isLoading}
                        className="inline-flex shrink-0 items-center justify-center rounded-xl bg-zinc-100 p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-red-950/30 dark:hover:text-red-400 disabled:opacity-60 cursor-pointer transition"
                        title={t("removeFriend") || "Retirer des amis"}
                        aria-label={t("removeFriend") || "Retirer des amis"}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserX className="h-4 w-4" />
                        )}
                      </button>
                    </>
                  )}

                  {/* CAS 2: Demande envoyée -> Annuler */}
                  {u.status === "FRIEND_REQUEST_SENT" && (
                    <button
                      type="button"
                      onClick={() => handleDeclineRequest(u)}
                      disabled={isLoading}
                      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-red-50 hover:text-red-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-red-950/30 dark:hover:text-red-400 disabled:opacity-60 cursor-pointer transition"
                    >
                      {isLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                      {t("cancel") || "Annuler"}
                    </button>
                  )}

                  {/* CAS 3: Demande reçue -> Accepter / Refuser */}
                  {u.status === "FRIEND_REQUEST_RECEIVED" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAcceptRequest(u)}
                        disabled={isLoading}
                        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-60 cursor-pointer transition"
                      >
                        {isLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        {t("accept") || "Accepter"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeclineRequest(u)}
                        disabled={isLoading}
                        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-zinc-100 p-2 text-sm font-semibold text-zinc-600 hover:bg-red-50 hover:text-red-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-red-950/30 dark:hover:text-red-400 disabled:opacity-60 cursor-pointer transition"
                        aria-label={t("decline") || "Refuser"}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  {/* CAS 4: Pas encore ami -> Ajouter */}
                  {u.status === "NOT_FRIEND" && (
                    <button
                      type="button"
                      onClick={() => handleAdd(u.id)}
                      disabled={isLoading}
                      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/20 hover:bg-violet-500 active:bg-violet-700 disabled:opacity-60 cursor-pointer transition"
                    >
                      {isLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UserPlus className="h-3.5 w-3.5" />
                      )}
                      {isLoading ? t("adding") || "Ajout..." : t("add") || "Ajouter"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}