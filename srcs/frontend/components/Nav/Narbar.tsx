"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950 text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          Heart<span className="text-violet-500">beat</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {/* <Link
            href="/discover"
            className="text-sm text-zinc-300 transition hover:text-white"
          >
            Discover
          </Link>

          <Link
            href="/live"
            className="text-sm text-zinc-300 transition hover:text-white"
          >
            Live
          </Link>

          <Link
            href="/community"
            className="text-sm text-zinc-300 transition hover:text-white"
          >
            Community
          </Link> */}

          <Link
            href="/sign-up"
            className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium transition hover:bg-violet-500"
          >
            Create account
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white md:hidden"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-t border-zinc-800 px-6 pb-5 pt-4 md:hidden">
          <div className="flex flex-col gap-2">
            {/* <Link
              href="/discover"
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-3 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Discover
            </Link>

            <Link
              href="/live"
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-3 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Live
            </Link>

            <Link
              href="/community"
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-3 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Community
            </Link> */}

            <Link
              href="/sign-up"
              onClick={() => setIsOpen(false)}
              className="mt-2 rounded-full bg-violet-600 px-4 py-3 text-center text-sm font-medium hover:bg-violet-500"
            >
              Create account
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
