"use client";

import { useRouter } from "next/navigation";

export default function SignUpPage() {
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

      {/* Sign-up card */}
      <div className="relative flex min-h-screen items-center justify-center px-6 py-10">
        <div
          onClick={stopPropagation}
          className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/90 p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">
              Join Heart<span className="text-violet-500">beat</span>
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Create your account and start connecting with friends.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Your name"
                required
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500"
              />
            </div>

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
                required
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                required
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Confirm password
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                required
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              Create account
            </button>
          </form>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <a
              href="/sign-in"
              className="text-violet-400 hover:text-violet-300"
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
