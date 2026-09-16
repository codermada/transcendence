"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("Nav");

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950 text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          {t("brand")}<span className="text-violet-500">{t("brandAccent")}</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-4 md:flex">
          <LanguageSwitcher />
          <ThemeToggle />

          <Link
            href="/sign-in"
            className="text-sm font-medium text-zinc-300 transition hover:text-white"
          >
            {t("signIn")}
          </Link>

          <Link
            href="/sign-up"
            className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium transition hover:bg-violet-500"
          >
            {t("createAccount")}
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <ThemeToggle />

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            aria-label={t("toggleMenu")}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="border-t border-zinc-800 px-6 pb-5 pt-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              href="/sign-in"
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              {t("signIn")}
            </Link>

            <Link
              href="/sign-up"
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-violet-600 px-4 py-2.5 text-center text-sm font-medium hover:bg-violet-500"
            >
              {t("createAccount")}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
