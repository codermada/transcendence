"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
        fixed bottom-0 left-0 top-16 z-40 w-64
        border-r border-zinc-200/80 bg-white/80 backdrop-blur-xl
        transition-colors dark:border-zinc-800/80 dark:bg-zinc-900/50
      "
    >
      <div
        aria-hidden
        className="
          pointer-events-none absolute inset-x-10 top-0 h-px
          bg-gradient-to-r from-transparent via-violet-500/50 to-transparent
          shadow-[0_0_14px_rgb(139_92_246_/_0.35)]
        "
      />

      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-zinc-200/80 px-6 py-5 dark:border-zinc-800/80">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {t("title")}
          </h2>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
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
                  group/nav relative flex items-center gap-3 rounded-xl px-3 py-2.5
                  text-sm font-medium transition-colors focus:outline-none
                  focus:ring-2 focus:ring-violet-500/20
                  ${
                    isActive
                      ? "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"
                      : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
                  }
                `}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="
                      absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2
                      rounded-full bg-violet-600 shadow-[0_0_10px_rgb(124_58_237_/_0.6)]
                      dark:bg-violet-500 dark:shadow-[0_0_10px_rgb(139_92_246_/_0.6)]
                    "
                  />
                )}

                <span
                  className={
                    isActive
                      ? "text-violet-600 dark:text-violet-400"
                      : "text-zinc-400 transition-colors group-hover/nav:text-zinc-600 dark:text-zinc-500 dark:group-hover/nav:text-zinc-300"
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