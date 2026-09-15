"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth/sign-in";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBackgroundClick = () => {
    router.push("/");
  };

  const stopPropagation = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await signIn({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Invalid email or password.");
        return;
      }

      router.push("/feed");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      onClick={handleBackgroundClick}
      className="relative min-h-screen overflow-hidden bg-zinc-950"
    >
      {/* Blurred background */}
      <div className="absolute inset-0 scale-110 bg-gradient-to-br from-violet-900/40 via-zinc-950 to-fuchsia-900/30 blur-2xl" />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Sign-in card */}
      <div className="relative flex min-h-screen items-center justify-center px-6 py-10">
        <div
          onClick={stopPropagation}
          className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/90 p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">
              Welcome back to Heart
              <span className="text-violet-500">beat</span>
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Sign in to continue connecting with friends.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-zinc-300"
                >
                  Password
                </label>

                <a
                  href="/forgot-password"
                  className="text-xs text-violet-400 hover:text-violet-300"
                >
                  Forgot password?
                </a>
              </div>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Your password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500"
              />
            </div>

            {/* Error */}
            {error && (
              <p
                className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400"
                role="alert"
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Sign up */}
          <p className="mt-6 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <a
              href="/sign-up"
              className="text-violet-400 hover:text-violet-300"
            >
              Create account
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
