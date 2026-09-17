import type { Metadata } from "next";
import "@/app/globals.css";
import { geistSans, geistMono } from "@/lib/fonts";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Providers } from '../providers';
import { Toaster } from "sonner";

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
      <body className="min-h-full flex flex-col bg-zinc-950 text-white">
        <Providers>
          <NextIntlClientProvider messages={messages}>
            {children}
              <Toaster
                theme="dark"
                position="top-right"
                toastOptions={{
                  classNames: {
                    toast: "border border-border bg-surface text-foreground",
                    description: "text-muted",
                    actionButton: "bg-brand-600 text-white",
                    cancelButton: "bg-surface text-muted",
                  },
                }}
              />
          </NextIntlClientProvider>
        </Providers>
        
      </body>
    </html>
  );
}
