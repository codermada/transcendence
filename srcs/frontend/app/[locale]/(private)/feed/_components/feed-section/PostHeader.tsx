"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { PostHeaderProps } from "./feed-section.types";

interface ExtendedPostHeaderProps extends PostHeaderProps {
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PostHeader({
  author,
  initials,
  createdAt,
  isOwner = false,
  onEdit,
  onDelete,
}: ExtendedPostHeaderProps) {
  const t = useTranslations("Feed.feed-section.PostHeader");
  const [createdAtTimestamp, setCreatedAtTimestamp] = useState({
    time: "minute",
    value: 0,
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!createdAt) return;
    const secondes = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / 1000
    );

    if (secondes < 60) {
      setCreatedAtTimestamp({ time: "minute", value: 0 });
    } else if (secondes < 3600) {
      setCreatedAtTimestamp({ time: "minute", value: Math.floor(secondes / 60) });
    } else if (secondes < 86400) {
      setCreatedAtTimestamp({ time: "hour", value: Math.floor(secondes / 3600) });
    } else {
      setCreatedAtTimestamp({ time: "day", value: Math.floor(secondes / 86400) });
    }
  }, [createdAt]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {initials}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {author}
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("timeAgo", {
              value: createdAtTimestamp.value,
              unit: createdAtTimestamp.time,
            })}
          </p>
        </div>
      </div>

      {isOwner && (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label={t("options")}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
              />
            </svg>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-9 z-10 w-36 overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-lg dark:border-zinc-800/80 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onEdit?.();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                  />
                </svg>
                {t("edit")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete?.();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
                {t("delete")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}