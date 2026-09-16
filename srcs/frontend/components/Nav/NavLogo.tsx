// components/Nav/NavLogo.tsx
"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { navStyles } from "./nav-styles";

interface NavLogoProps {
  href: string;
}

export function NavLogo({ href }: NavLogoProps) {
  const t = useTranslations("Nav");

  return (
    <Link href={href} className={navStyles.logo}>
      {t("brand")}
      <span className={navStyles.logoAccent}>{t("brandAccent")}</span>
    </Link>
  );
}