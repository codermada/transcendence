"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/use-session";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session) {
      router.replace("/feed");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-white">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading...</p>
      </main>
    );
  }

  if (session) {
    return null;
  }

  return <>{children}</>;
}
