"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { PostHeaderProps } from "./feed-section.types";

interface ExtendedPostHeaderProps extends PostHeaderProps {
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

function formatTimeAgo(createdAt: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 1000
  );

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  return `${days}d`;
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
  const [timeAgo, setTimeAgo] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!createdAt) return;
    setTimeAgo(formatTimeAgo(createdAt));
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
            {timeAgo}
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
            {/* ...unchanged svg... */}
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-9 z-10 w-36 overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-lg dark:border-zinc-800/80 dark:bg-zinc-900">
              {/* ...unchanged edit / delete buttons... */}
            </div>
          )}
        </div>
      )}
    </div>
  );
}