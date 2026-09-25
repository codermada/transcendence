"use client";

import { useTranslations } from "next-intl";
import type { Tab } from "./types";

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

export function FriendRequestTabs({
  value,
  onChange,
  incomingCount,
  outgoingCount,
}: {
  value: Tab;
  onChange: (tab: Tab) => void;
  incomingCount: number;
  outgoingCount: number;
}) {
  const t = useTranslations("FriendRequests");

  return (
    <div
      role="tablist"
      aria-label={t("tabsAriaLabel")}
      className="inline-flex rounded-xl border border-zinc-200/80 bg-white/70 p-1 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/40"
    >
      <TabButton
        active={value === "incoming"}
        onClick={() => onChange("incoming")}
        count={incomingCount}
      >
        {t("tabs.incoming")}
      </TabButton>
      <TabButton
        active={value === "outgoing"}
        onClick={() => onChange("outgoing")}
        count={outgoingCount}
      >
        {t("tabs.outgoing")}
      </TabButton>
    </div>
  );
}