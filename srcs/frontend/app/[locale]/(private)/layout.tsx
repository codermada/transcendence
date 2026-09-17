"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useSession } from "@/lib/auth/use-session";
import { AuthenticatedNavbar } from "@/components/Nav/AuthenticatedNavbar";
import { MobileBottomNav } from "@/components/Nav/MobileBottomNav";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/sign-in");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          <p className="text-sm text-zinc-400">Loading...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <AuthenticatedNavbar />
      <main className="flex-1 pt-14 pb-16 md:pb-0">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
