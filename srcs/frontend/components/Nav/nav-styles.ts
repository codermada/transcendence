// components/Nav/nav-styles.ts
export const navStyles = {
  // Outer container
  shell:
    "border-b border-zinc-200/80 bg-white/90 text-zinc-900 backdrop-blur-sm transition-colors dark:border-zinc-800 dark:bg-zinc-950/90 dark:text-white",
  inner: "mx-auto flex h-16 items-center justify-between px-6",

  // Logo
  logo: "text-xl font-bold tracking-tight text-zinc-900 dark:text-white",
  logoAccent: "text-violet-600 dark:text-violet-500",

  // Nav link (Feed, Play, Leaderboard, etc.)
  navLink:
    "rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white",

  // Plain text link (Sign in)
  textLink:
    "text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white",

  // Primary violet CTA (Create account)
  primaryButton:
    "rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-500 active:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500",

  // Secondary outline button (Sign out)
  secondaryButton:
    "rounded-xl border border-zinc-300/80 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-violet-500 hover:bg-violet-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-violet-500 dark:hover:bg-violet-600 dark:hover:text-white",

  // Icon-only button (hamburger, theme toggle)
  iconButton:
    "rounded-xl p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white",

  // Mobile dropdown container
  mobileMenu:
    "border-t border-zinc-200/80 bg-white px-6 pb-5 pt-4 transition-colors dark:border-zinc-800 dark:bg-zinc-950 md:hidden",
  mobileLink:
    "rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white",
  mobilePrimaryButton:
    "rounded-full bg-violet-600 px-4 py-2.5 text-center text-sm font-medium text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-500",
} as const;