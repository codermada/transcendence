// components/Nav/nav-styles.ts
export const navStyles = {
  // Outer container
  shell:
    "border-b border-zinc-800 bg-zinc-950/90 text-white backdrop-blur-sm",
  inner: "mx-auto flex h-16 items-center justify-between px-6",

  // Logo
  logo: "text-xl font-bold tracking-tight",
  logoAccent: "text-violet-500",

  // Nav link (Feed, Play, Leaderboard, etc.)
  navLink:
    "rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white",

  // Plain text link (Sign in)
  textLink:
    "text-sm font-medium text-zinc-300 transition hover:text-white",

  // Primary violet CTA (Create account)
  primaryButton:
    "rounded-full bg-violet-600 px-4 py-2 text-sm font-medium transition hover:bg-violet-500",

  // Secondary outline button (Sign out)
  secondaryButton:
    "rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-violet-500 hover:bg-violet-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50",

  // Icon-only button (hamburger, theme toggle)
  iconButton:
    "rounded-lg p-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white",

  // Mobile dropdown container
  mobileMenu: "border-t border-zinc-800 px-6 pb-5 pt-4 md:hidden",
  mobileLink:
    "rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white",
  mobilePrimaryButton:
    "rounded-full bg-violet-600 px-4 py-2.5 text-center text-sm font-medium hover:bg-violet-500",
} as const;