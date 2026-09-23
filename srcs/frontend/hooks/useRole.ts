"use client";

import { authClient } from "@/lib/auth/auth-client";

export type Role = "user" | "moderator" | "admin";

export function useRole() {
  const { data: session, isPending } = authClient.useSession();

  const role = session?.user?.role as Role | undefined;

  return {
    role,
    isPending,
    isAuthenticated: !!session?.user,
    isUser: role === "user",
    isModerator: role === "moderator" || role === "admin",
    isAdmin: role === "admin",
  };
}