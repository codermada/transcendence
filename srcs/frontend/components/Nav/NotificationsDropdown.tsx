"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Bell } from "@/components/icons";

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread] = useState(false); // In future connected to WebSocket / store
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations("Nav");

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t("notifications")}
        className="
          relative flex h-9 w-9 items-center justify-center rounded-xl
          border border-zinc-200/80 bg-white text-zinc-600 shadow-xs
          transition-all duration-200
          hover:border-zinc-300 hover:bg-zinc-100/80 hover:text-zinc-900
          focus:outline-none focus:ring-2 focus:ring-violet-500/20
          dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 dark:shadow-none
          dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white
          cursor-pointer
        "
      >
        <Bell className="h-4 w-4" />
        {hasUnread && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-violet-600 ring-2 ring-white dark:bg-violet-500 dark:ring-zinc-950"
          />
        )}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          className="
            absolute right-0 top-full z-50 mt-2 w-72 origin-top-right sm:w-80
            rounded-2xl border border-zinc-200/80 bg-white/95 p-3 shadow-xl backdrop-blur-xl
            animate-in fade-in zoom-in-95 duration-100
            dark:border-zinc-800 dark:bg-zinc-950/95 dark:shadow-2xl dark:shadow-black/80
          "
        >
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800/70">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              {t("notifications")}
            </h3>
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {t("zeroUnread")}
            </span>
          </div>

          <div className="py-8 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500">
              <Bell className="h-5 w-5" />
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t("noNotifications")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}