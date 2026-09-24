"use client";

import { useTranslations } from "next-intl";

export function ChatMessageGenericFile({ url, isMe = false }: { url: string, isMe?: boolean }) {
	const t = useTranslations("Chat");

	return (
    <a
      key={url}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download
      className={`flex items-center gap-3 rounded-xl p-3 text-xs font-medium transition ${
        isMe
          ? "bg-violet-700/60 text-white hover:bg-violet-700"
          : "bg-zinc-200/80 text-zinc-900 hover:bg-zinc-300/80 dark:bg-zinc-700/80 dark:text-white dark:hover:bg-zinc-700"
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/10 dark:bg-white/10">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{url.split("/").pop()}</p>
        <p className="text-[10px] opacity-75">{t("download")}</p>
      </div>
      <svg className="h-4 w-4 shrink-0 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    </a>
  );
}
