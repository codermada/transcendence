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
          relative flex h-9 w-9 items-center justify-center rounded-full
          bg-zinc-900/80 text-zinc-300 border border-zinc-800/80
          transition hover:bg-zinc-800 hover:text-white
          focus:outline-none focus:ring-2 focus:ring-violet-500/40
        "
      >
        <Bell className="h-4 w-4" />
        {hasUnread && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-zinc-950"
          />
        )}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          className="
            absolute right-0 top-full mt-2 w-72 sm:w-80
            origin-top-right rounded-2xl
            border border-zinc-800/90
            bg-zinc-950/95 p-3
            shadow-2xl shadow-black/80
            backdrop-blur-xl z-50
            animate-in fade-in zoom-in-95 duration-100
          "
        >
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/70">
            <h3 className="text-sm font-semibold text-white">
              {t("notifications")}
            </h3>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
              {t("zeroUnread")}
            </span>
          </div>

          <div className="py-8 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-zinc-500">
              <Bell className="h-5 w-5" />
            </div>
            <p className="text-xs text-zinc-400">
              {t("noNotifications")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
