"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { LayoutDashboard, Users } from "@/components/icons";

type AdminNavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

export default function AdminNav() {
  const t = useTranslations("Admin.nav");
  const pathname = usePathname();

  const navItems: AdminNavItem[] = [
    {
      label: t("dashboard"),
      href: "/admin",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: t("users"),
      href: "/admin/users",
      icon: <Users className="h-4 w-4" />,
    },
  ];

  return (
    <aside
      className="
        fixed left-0 top-16 bottom-0 z-40 w-64
        border-r border-border
        bg-surface/40
        backdrop-blur-xl
      "
    >
      {/* Futuristic top line */}
      <div
        aria-hidden
        className="
          pointer-events-none
          absolute inset-x-10 top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-brand-500/50
          to-transparent
          shadow-[0_0_14px_rgb(139_92_246_/_0.35)]
        "
      />

      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {t("title")}
          </h2>

          <p className="mt-1 text-sm text-muted">
            {t("subtitle")}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 p-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`
                  group/nav
                  relative
                  flex items-center gap-3
                  rounded-xl
                  px-3 py-2.5
                  text-sm font-medium
                  transition-colors
                  focus:outline-none
                  focus:ring-2 focus:ring-brand-500/20
                  ${
                    isActive
                      ? "bg-brand-500/10 text-foreground"
                      : "text-muted hover:bg-surface-hover hover:text-foreground"
                  }
                `}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="
                      absolute left-0 top-1/2
                      h-5 w-0.5
                      -translate-y-1/2
                      rounded-full
                      bg-brand-500
                      shadow-[0_0_10px_rgb(139_92_246_/_0.6)]
                    "
                  />
                )}

                <span
                  className={
                    isActive
                      ? "text-brand-400"
                      : "text-muted group-hover/nav:text-subtle"
                  }
                >
                  {item.icon}
                </span>

                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}