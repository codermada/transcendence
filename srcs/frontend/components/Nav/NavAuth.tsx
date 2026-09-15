"use client";

import { useState } from "react";
import { signOut } from "@/lib/auth/sign-out";

export function NavAuth() {
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);

    try {
      const result = await signOut();

      if (result.error) {
        console.error(result.error);
        return;
      }

      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/90 text-white backdrop-blur-sm">
      <div className="mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <a href="/feed" className="text-xl font-bold tracking-tight">
          Heart<span className="text-violet-500">beat</span>
        </a>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <a
            href="/feed"
            className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
          >
            Feed
          </a>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={loading}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-violet-500 hover:bg-violet-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </nav>
  );
}
