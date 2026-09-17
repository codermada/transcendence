"use client";

import { useState, useRef, useEffect } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

  const currentObj =
    LOCALES.find((l) => l.code === currentLocale) || LOCALES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2
          rounded-xl border border-zinc-200/80 bg-white
          px-3 py-1.5
          text-xs font-semibold text-zinc-700 shadow-xs
          transition-all duration-200
          hover:border-zinc-300 hover:bg-zinc-100/80 hover:text-zinc-900
          focus:outline-none focus:ring-2 focus:ring-violet-500/20
          dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300 dark:shadow-none
          dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white
          cursor-pointer
        "
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none">{currentObj.flag}</span>
        <span className="uppercase">{currentObj.code}</span>
        <svg
          className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 dark:text-zinc-500 ${
            isOpen ? "rotate-180 text-violet-600 dark:text-violet-400" : ""
          }`}
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

      {isOpen && (
        <div
          className="
            absolute right-0 top-full z-50 mt-1.5
            w-36 rounded-2xl
            border border-zinc-200/80 bg-white/95 p-1.5
            shadow-xl backdrop-blur-md
            animate-in fade-in zoom-in-95 duration-100
            dark:border-zinc-800 dark:bg-zinc-950/95 dark:shadow-2xl dark:shadow-black/60
          "
        >
          <ul className="flex flex-col gap-0.5">
            {LOCALES.map(({ code, label, flag }) => {
              const isActive = code === currentLocale;
              return (
                <li key={code}>
                  <button
                    type="button"
                    onClick={() => handleLocaleChange(code)}
                    className={`
                      flex w-full items-center gap-2.5
                      rounded-xl px-2.5 py-1.5
                      text-xs font-medium
                      transition-colors
                      cursor-pointer
                      ${
                        isActive
                          ? "bg-violet-100 text-violet-700 font-semibold dark:bg-violet-500/20 dark:text-violet-400"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
                      }
                    `}
                  >
                    <span className="text-sm leading-none">{flag}</span>
                    <span className="flex-1 text-left">{label}</span>
                    {isActive && (
                      <svg
                        className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400"
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
        </div>
      )}
    </div>
  );
}