"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ProfileTabs({ username }: { username: string }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Tout", href: `/profile/${username}` },
    { name: "Amis", href: `/profile/${username}/friends` },
    { name: "Photos", href: `/profile/${username}/photos` },
  ];

  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl px-4">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-5 py-4 font-medium ${
              pathname === tab.href
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
