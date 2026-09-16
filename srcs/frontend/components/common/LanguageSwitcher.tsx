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
    } catch {
    }
  }
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentObj = LOCALES.find((l) => l.code === currentLocale) || LOCALES[0];

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

  const handleLocaleChange = (newLocale: string) => {
    setIsOpen(false);
    if (newLocale === currentLocale) return;

    setLocaleStorageAndCookie(newLocale);
    router.replace(pathname, { locale: newLocale });
    router.refresh();
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 hover:text-white focus:outline-none"
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1.5 w-36 rounded-xl border border-zinc-800 bg-zinc-900/95 p-1.5 shadow-2xl backdrop-blur-md">
          <ul className="flex flex-col gap-1">
            {LOCALES.map(({ code, label, flag }) => {
              const isActive = code === currentLocale;
              return (
                <li key={code}>
                  <button
                    type="button"
                    onClick={() => handleLocaleChange(code)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                      isActive
                        ? "bg-violet-600/20 text-violet-400 font-semibold"
                        : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <span className="text-sm leading-none">{flag}</span>
                    <span className="flex-1 text-left">{label}</span>
                    {isActive && (
                      <svg className="h-3.5 w-3.5 text-violet-400" viewBox="0 0 20 20" fill="currentColor">
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
