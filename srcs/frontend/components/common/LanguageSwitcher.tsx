"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

const LOCALES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

function setLocaleStorageAndCookie(locale: string) {
  if (typeof window !== "undefined") {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    try {
      localStorage.setItem("NEXT_LOCALE", locale);
    } catch {}
  }
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentObj =
    LOCALES.find((l) => l.code === currentLocale) || LOCALES[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Position the portal under the button
  useEffect(() => {
    if (!isOpen) return;

    const update = () => {
      const btn = buttonRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 6,
        left: rect.right - 144, // menu width ~ w-36 (144px)
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [isOpen]);

  // Click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Escape closes
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const handleLocaleChange = (newLocale: string) => {
    setIsOpen(false);
    if (newLocale === currentLocale) return;

    setLocaleStorageAndCookie(newLocale);
    router.replace(pathname, { locale: newLocale });
    router.refresh();
  };

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="
          flex items-center gap-2
          rounded-lg border border-border
          bg-surface/90
          px-3 py-1.5
          text-xs font-semibold text-subtle
          transition
          hover:border-border-hover hover:text-foreground
          focus:outline-none focus:ring-2 focus:ring-brand-500/20
        "
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none">{currentObj.flag}</span>
        <span className="uppercase">{currentObj.code}</span>
        <svg
          className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {mounted &&
        isOpen &&
        menuPos &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: menuPos.top, left: menuPos.left }}
            className="
              fixed z-[9999]
              w-36
              rounded-xl
              border border-border
              bg-surface/95
              p-1.5
              shadow-2xl shadow-black/40
              backdrop-blur-md
            "
          >
            <ul className="flex flex-col gap-1">
              {LOCALES.map(({ code, label, flag }) => {
                const isActive = code === currentLocale;
                return (
                  <li key={code}>
                    <button
                      type="button"
                      onClick={() => handleLocaleChange(code)}
                      className={`
                        flex w-full items-center gap-2.5
                        rounded-lg px-2.5 py-1.5
                        text-xs font-medium
                        transition
                        ${
                          isActive
                            ? "bg-brand-500/20 font-semibold text-brand-400"
                            : "text-subtle hover:bg-surface-hover hover:text-foreground"
                        }
                      `}
                    >
                      <span className="text-sm leading-none">{flag}</span>
                      <span className="flex-1 text-left">{label}</span>
                      {isActive && (
                        <svg
                          className="h-3.5 w-3.5 text-brand-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}