"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth/auth-client";

type AdminGuardProps = {
  children: ReactNode;
  /** Where to send unauthenticated users. */
  signInPath?: string;
  /** Where to send authenticated non-admins. */
  fallbackPath?: string;
};

export function AdminGuard({
  children,
  signInPath = "/sign-in",
  fallbackPath = "/feed",
}: AdminGuardProps) {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;
  const role = user?.role;

  useEffect(() => {
    if (isPending) return;

    // Not signed in → sign-in
    if (!user) {
      router.replace(signInPath);
      return;
    }

    // Signed in but no role yet → wait (don't redirect a real admin)
    if (role == null) return;

    // Signed in, wrong role → fallback
    if (role !== "admin") {
      router.replace(fallbackPath);
    }
  }, [user, role, isPending, router, signInPath, fallbackPath]);

  // Loading
  if (isPending) {
    return <AdminGuardLoading />;
  }

  // Not signed in
  if (!user) return null;

  // Role unknown — render nothing rather than children, to avoid flash
  if (role == null) return null;

  // Not admin
  if (role !== "admin") return null;

  return <>{children}</>;
}

function AdminGuardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div
        className="
          flex items-center gap-3
          rounded-xl
          border border-border
          bg-surface/40
          px-4 py-2.5
          text-sm text-muted
          shadow-2xl shadow-black/20
          backdrop-blur-xl
        "
      >
        <span
          aria-hidden
          className="
            h-3.5 w-3.5
            animate-spin
            rounded-full
            border-2
            border-brand-500/30
            border-t-brand-500
          "
        />
        Loading…
      </div>
    </div>
  );
}