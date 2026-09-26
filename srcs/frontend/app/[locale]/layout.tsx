import "@/app/globals.css";
import { routing } from "@/i18n/routing";
import { geistMono, geistSans } from "@/lib/fonts";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import { Providers } from "../providers";

export const metadata: Metadata = {
  title: "Heartbeat",
  description: "A social platform",
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col bg-white text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100"
      >
        <Providers>
          <NextIntlClientProvider messages={messages}>
            {children}
            <Toaster position="top-right" closeButton />
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}