"use client";

import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { signOut } from "@/lib/auth/sign-out";
import { usePresence } from "@/hooks/use-presence";
import {
  User,
  Settings,
  Shield,
  KeyRound,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Loader,
} from "@/components/icons";

type MeUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
};

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [user, setUser] = useState<MeUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations("Nav");
  const { isOnline } = usePresence();

  // Fetch current user
  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const res = await fetch("/nest/user/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          if (!cancelled) setUser(null);
          return;
        }

        const data = (await res.json()) as MeUser;
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoadingUser(false);
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  const isAdmin = user?.role === "admin";

  const displayName =
    user?.name?.trim() || user?.email?.split("@")[0] || t("user");

  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

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

  // Escape key to close
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

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      const result = await signOut();
      if (result?.error) {
        toast.error(t("signOutError"));
        return;
      }
      setIsOpen(false);
      window.location.href = "/sign-in";
    } catch {
      toast.error(t("signOutError"));
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Open user menu"
        className="
          flex items-center gap-1.5 rounded-full p-1
          transition-all duration-150 hover:bg-zinc-100 dark:hover:bg-zinc-800/80
          focus:outline-none focus:ring-2 focus:ring-violet-500/40 cursor-pointer
        "
      >
        <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-semibold text-white shadow-md ring-1 ring-black/5 dark:ring-white/10">
          {isLoadingUser ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={displayName}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
          {/* Online / Offline badge dot */}
          <span
            aria-label={isOnline ? t("online") : t("offline")}
            title={isOnline ? t("online") : t("offline")}
            className={`
              absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-zinc-950 transition-colors duration-300
              ${isOnline ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"}
            `}
          >
            {isOnline && (
              <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
            )}
          </span>
        </div>

        <ChevronDown
          className={`hidden h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 dark:text-zinc-400 sm:block ${
            isOpen ? "rotate-180 text-violet-600 dark:text-violet-400" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          className="
            absolute right-0 top-full z-50 mt-2 w-72 origin-top-right sm:w-80
            rounded-2xl border border-zinc-200/80 bg-white/95 p-2
            shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100
            dark:border-zinc-800/90 dark:bg-zinc-950/95 dark:shadow-2xl dark:shadow-black/80
          "
        >
          {/* User Profile Header */}
          <div className="flex items-center gap-3 rounded-xl bg-zinc-100/80 p-3 dark:bg-zinc-900/60">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-semibold text-white ring-1 ring-black/5 dark:ring-white/10">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={displayName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
              <span
                aria-hidden="true"
                className={`
                  absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-zinc-900 transition-colors duration-300
                  ${isOnline ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"}
                `}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                  {displayName}
                </p>
                {isOnline ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t("online")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-500/10 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-500/15 dark:text-zinc-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                    {t("offline")}
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {user?.email || ""}
              </p>
            </div>
          </div>

          <div className="my-1.5 h-px bg-zinc-200/70 dark:bg-zinc-800/70" />

          {/* Navigation Links */}
          <div className="flex flex-col gap-0.5">
            <Link
              href={`/profile/${user?.id || ""}`}
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className="
                flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium
                text-zinc-600 transition-colors
                hover:bg-zinc-100 hover:text-zinc-900
                dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white
              "
            >
              <User className="h-4 w-4 text-zinc-400 dark:text-zinc-400" />
              <span>{t("profile")}</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className="
                flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium
                text-zinc-600 transition-colors
                hover:bg-zinc-100 hover:text-zinc-900
                dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white
              "
            >
              <Settings className="h-4 w-4 text-zinc-400 dark:text-zinc-400" />
              <span>{t("settings")}</span>
            </Link>

            <Link
              href="/settings/security"
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className="
                flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium
                text-zinc-600 transition-colors
                hover:bg-zinc-100 hover:text-zinc-900
                dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white
              "
            >
              <Shield className="h-4 w-4 text-zinc-400 dark:text-zinc-400" />
              <span>{t("security")}</span>
            </Link>

            <Link
              href="/settings/api-keys"
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className="
                flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium
                text-zinc-600 transition-colors
                hover:bg-zinc-100 hover:text-zinc-900
                dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white
              "
            >
              <KeyRound className="h-4 w-4 text-zinc-400 dark:text-zinc-400" />
              <span>{t("apiKeys")}</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                role="menuitem"
                className="
                  flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium
                  text-violet-600 transition-colors
                  hover:bg-violet-50 hover:text-violet-700
                  dark:text-violet-300 dark:hover:bg-violet-500/10 dark:hover:text-violet-200
                "
              >
                <LayoutDashboard className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <span>{t("admin")}</span>
              </Link>
            )}
          </div>

          <div className="my-1.5 h-px bg-zinc-200/70 dark:bg-zinc-800/70" />

          {/* Sign Out Action */}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            role="menuitem"
            className="
              flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
              text-rose-600 transition-colors
              hover:bg-rose-50 hover:text-rose-700
              dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300
              disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer
            "
          >
            {isSigningOut ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            <span>{isSigningOut ? t("signingOut") : t("signOut")}</span>
          </button>
        </div>
      )}
    </div>
  );
}