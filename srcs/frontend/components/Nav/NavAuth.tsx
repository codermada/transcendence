// components/Nav/NavAuth.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { signOut } from "@/lib/auth/sign-out";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { NavShell } from "./NavShell";
import { NavLogo } from "./NavLogo";
import { NavLink } from "./NavLink";
import { MobileMenuButton } from "./MobileMenuButton";
import { navStyles } from "./nav-styles";

export function NavAuth() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useTranslations("Nav");

  async function handleSignOut() {
    setLoading(true);
    try {
      const result = await signOut();
      if (result.error) {
        console.error(result.error);
        return;
      }
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <NavShell
      below={
        isOpen && (
          <div className={navStyles.mobileMenu}>
            <div className="flex flex-col gap-3">
              <NavLink
                href="/feed"
                variant="mobile"
                onClick={() => setIsOpen(false)}
              >
                {t("feed")}
              </NavLink>

              <NavLink
                href="/settings"
                variant="mobile"
                onClick={() => setIsOpen(false)}
              >
                {t("settings")}
              </NavLink>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={loading}
                className={navStyles.mobilePrimaryButton}
              >
                {loading ? t("signingOut") : t("signOut")}
              </button>
            </div>
          </div>
        )
      }
    >
      <NavLogo href="/feed" />

      {/* Desktop */}
      <div className="hidden items-center gap-3 md:flex">
        <NavLink href="/feed">{t("feed")}</NavLink>
        <NavLink href="/settings">{t("settings")}</NavLink>
        <LanguageSwitcher />
        <ThemeToggle />
        <button
          type="button"
          onClick={handleSignOut}
          disabled={loading}
          className={navStyles.secondaryButton}
        >
          {loading ? t("signingOut") : t("signOut")}
        </button>
      </div>

      {/* Mobile */}
      <div className="flex items-center gap-2 md:hidden">
        <LanguageSwitcher />
        <ThemeToggle />
        <MobileMenuButton isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      </div>
    </NavShell>
  );
}