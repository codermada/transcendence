"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useSession } from "@/lib/auth/use-session";
import { AuthenticatedNavbar } from "@/components/Nav/AuthenticatedNavbar";
import { MobileBottomNav } from "@/components/Nav/MobileBottomNav";
import { usePresenceInit } from "@/hooks/use-presence";
import { useChatSocketInit } from "@/hooks/use-chat-socket";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  usePresenceInit();
  useChatSocketInit();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/sign-in");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-600 border-t-transparent dark:border-violet-400 dark:border-t-transparent" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-white">
      <AuthenticatedNavbar />
      <main className="flex-1 pt-14 pb-16 md:pb-0">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
