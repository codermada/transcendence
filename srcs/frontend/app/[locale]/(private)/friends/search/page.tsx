"use client";

import { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Search, ArrowLeft, Loader2, UserPlus, MessageSquare } from "@/components/icons";
import { NewMessageModal, type ReceiverUser } from "@/components/chat/NewMessageModal";

type SearchUser = {
  id: string;
  name: string;
  image: string | null;
  pseudo?: string | null;
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
  const tChat = useTranslations("Chat");
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAddId, setPendingAddId] = useState<string | null>(null);
  const [checkingUserId, setCheckingUserId] = useState<string | null>(null);
  const [modalReceiver, setModalReceiver] = useState<ReceiverUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fire the request whenever `query` changes.
  // (No debounce — fine for a small dataset. Add one later if needed.)
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

  async function handleAdd(userId: string) {
    setPendingAddId(userId);

    try {
      const res = await fetch("/nest/friend", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresseeId: userId }),
      });

      if (res.ok) {
        // Remove the user from results on success
        setResults((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch {
      // Optionally surface an error here
    } finally {
      setPendingAddId(null);
    }
  }

  async function handleMessageClick(user: SearchUser) {
    setCheckingUserId(user.id);

    try {
      const res = await fetch(`/nest/chat/conversation/${user.id}`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          router.push(`/chat/${data.id}`);
          return;
        }
      }

      setModalReceiver(user);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to check conversation:", err);
      setModalReceiver(user);
      setIsModalOpen(true);
    } finally {
      setCheckingUserId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3 border-b border-zinc-200/80 pb-5 dark:border-zinc-800">
        <Link
          href="/friends"
          className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="Back"
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
            const isPending = pendingAddId === u.id;
            const isChecking = checkingUserId === u.id;
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
                  <span className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                    {u.name}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleMessageClick(u)}
                    disabled={isPending || isChecking}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-500 active:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                  >
                    {isChecking ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <MessageSquare className="h-3.5 w-3.5" />
                    )}
                    {tChat("message")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdd(u.id)}
                    disabled={isPending}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-500 active:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    {isPending ? t("adding") : t("add")}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <NewMessageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        receiver={modalReceiver}
      />
    </div>
  );
}
