"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "@teispace/next-themes";
import { useTranslations } from "next-intl";

import { Sun, Moon } from "@/components/icons";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("Nav");

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-lg p-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
      aria-label={
        mounted
          ? isDark
            ? t("switchToLight")
            : t("switchToDark")
          : t("toggleTheme")
      }
    >
      {/* Render a placeholder with the same size before mounting to avoid layout shift */}
      {!mounted ? (
        <span className="block h-5 w-5" />
      ) : isDark ? (
        // Sun icon (shown in dark mode → click to go light)
        <Sun className="h-5 w-5" />
      ) : (
        // Moon icon (shown in light mode → click to go dark)
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}