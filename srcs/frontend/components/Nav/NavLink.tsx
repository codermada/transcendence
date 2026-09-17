// components/Nav/NavLink.tsx
"use client";

import { Link } from "@/i18n/routing";
import { navStyles } from "./nav-styles";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: "default" | "text" | "mobile";
  onClick?: () => void;
}

export function NavLink({
  href,
  children,
  variant = "default",
  onClick,
}: NavLinkProps) {
  const className =
    variant === "text"
      ? navStyles.textLink
      : variant === "mobile"
        ? navStyles.mobileLink
        : navStyles.navLink;

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}