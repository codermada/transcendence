import "@/app/globals.css";
import { geistSans, geistMono } from "@/lib/fonts";
import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <html className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col items-center justify-center bg-zinc-950 px-6 text-white">
        <div className="text-center">
          <h1 className="text-6xl font-extrabold text-violet-500">404</h1>
          <h2 className="mt-4 text-2xl font-bold">Page Not Found</h2>
          <p className="mt-2 text-sm text-zinc-400">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Back to Home
          </Link>
        </div>
      </body>
    </html>
  );
}
