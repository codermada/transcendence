"use client";

import { useTheme } from "@teispace/next-themes";
import { useTranslations } from "next-intl";
import React from "react";

import { Moon, Sun } from "@/components/icons";

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const t = useTranslations("Nav");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="
        inline-flex h-9 w-9 items-center justify-center rounded-xl
        border border-zinc-200/80 bg-white text-zinc-600 shadow-xs
        transition-all duration-200
        hover:border-zinc-300 hover:bg-zinc-100/80 hover:text-zinc-900
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/20
        dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 dark:shadow-none
        dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white
        cursor-pointer
      "
      aria-label={
        !mounted
          ? t("toggleTheme")
          : isDark
            ? t("switchToLight")
            : t("switchToDark")
      }
    >
      {/* Render a placeholder with the same size before mounting to avoid layout shift */}
      {!mounted ? (
        <span className="block h-4 w-4" aria-hidden="true" />
      ) : isDark ? (
        // Sun icon (shown in dark mode → click to go light)
        <Sun className="h-4 w-4 transition-transform duration-200 hover:rotate-45" aria-hidden="true" />
      ) : (
        // Moon icon (shown in light mode → click to go dark)
        <Moon className="h-4 w-4 transition-transform duration-200 hover:-rotate-12" aria-hidden="true" />
      )}
    </button>
  );
}