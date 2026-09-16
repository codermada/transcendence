"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";

import { Key, User, Shield } from "@/components/icons";

type SettingsLink = {
  href: string;
  titleKey: string;
  descKey: string;
  icon: React.ReactNode;
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Settings.home");
  const pathname = usePathname();

  const links: SettingsLink[] = [
    {
      href: "/settings/api-keys",
      titleKey: "apiKeysTitle",
      descKey: "apiKeysDesc",
      icon: <Key className="h-4 w-4" />,
    },
    {
      href: "/settings/profile",
      titleKey: "profileTitle",
      descKey: "profileDesc",
      icon: <User className="h-4 w-4" />,
    },
    {
      href: "/settings/security",
      titleKey: "securityTitle",
      descKey: "securityDesc",
      icon: <Shield className="h-4 w-4" />,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        {/* ===== Left vertical nav ===== */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <nav
            aria-label={t("title")}
            className="
              flex flex-col gap-1
              rounded-2xl
              border border-border
              bg-surface/40
              p-2
              shadow-2xl
              shadow-black/20
              backdrop-blur-xl
            "
          >
            {links.map((link) => {
              const isActive = pathname === link.href;
              const description = t(link.descKey);

              return (
                <div key={link.href} className="group/nav">
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    aria-describedby={`desc-${link.titleKey}`}
                    className={`
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
                      {link.icon}
                    </span>

                    <span className="truncate">{t(link.titleKey)}</span>
                  </Link>

                  {/* Description — expands below on hover */}
                  <div
                    id={`desc-${link.titleKey}`}
                    className="
                      grid grid-rows-[0fr]
                      transition-[grid-template-rows] duration-200 ease-out
                      group-hover/nav:grid-rows-[1fr]
                      group-focus-within/nav:grid-rows-[1fr]
                    "
                  >
                    <div className="overflow-hidden">
                      <p
                        className="
                          px-3 pb-2 pt-1
                          text-xs leading-relaxed text-muted
                          opacity-0
                          transition-opacity duration-200
                          group-hover/nav:opacity-100
                          group-focus-within/nav:opacity-100
                        "
                      >
                        {description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* ===== Right content ===== */}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}