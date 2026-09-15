"use client";

import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const handleBackgroundClick = () => {
    router.push("/");
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <main
      onClick={handleBackgroundClick}
      className="relative min-h-screen overflow-hidden bg-zinc-950"
    >
      {/* Blurred background */}
      <div className="absolute inset-0 scale-110 bg-gradient-to-br from-violet-900/40 via-zinc-950 to-fuchsia-900/30 blur-2xl" />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Forgot password card */}
      <div className="relative flex min-h-screen items-center justify-center px-6 py-10">
        <div
          onClick={stopPropagation}
          className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/90 p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">
              Forgot your password?
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5">
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
                required
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              Send reset link
            </button>
          </form>

          {/* Back to sign in */}
          <p className="mt-6 text-center text-sm text-zinc-500">
            Remember your password?{" "}
            <a
              href="/sign-in"
              className="text-violet-400 hover:text-violet-300"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
