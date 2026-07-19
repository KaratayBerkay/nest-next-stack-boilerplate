import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import Script from "next/script";
import { JsonLd } from "@/lib/seo/JsonLd";
import { QueryProvider } from "@/integrations/tanstack-query/QueryProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";

import { DeviceTypeInit } from "@/components/DeviceTypeInit";
import { EventLoggerInit } from "@/components/EventLoggerInit";
import { PushNotificationInit } from "@/components/PushNotificationInit";
import { SessionBridge } from "@/components/SessionBridge";
import { ToastProvider, ToastViewport } from "@/components/ui/Toast";
import { getAllMessages } from "@/lib/i18n/get-all-messages";
import { DEFAULT_LANG } from "@/constants/i18n";
import type { I18nMessages } from "@/generated/i18n-messages";
import { ClientLocaleProvider } from "@/components/ClientLocaleProvider";
import { TimezoneProvider } from "@/components/TimezoneProvider";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { DateDisplayProvider } from "@/components/DateDisplayProvider";
import { clientEnv } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f0f0f",
};

export const metadata: Metadata = {
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_APP_URL),
  title: {
    default: "Next.js Boilerplate",
    template: "%s — Next.js Boilerplate",
  },
  description: "A battle-tested Next.js 16 boilerplate.",
  manifest: "/manifest.json",
};

const THEME_NAMES = [
  "light",
  "dark",
  "shiny",
  "glass",
  "neon",
  "gradient",
] as const;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = getAllMessages<I18nMessages>(DEFAULT_LANG);

  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme")?.value;
  const activeTheme =
    themeCookie &&
    THEME_NAMES.includes(themeCookie as (typeof THEME_NAMES)[number])
      ? (themeCookie as (typeof THEME_NAMES)[number])
      : null;

  const classes = [
    geistSans.variable,
    geistMono.variable,
    "h-full antialiased",
  ];
  if (activeTheme) {
    classes.push(`style-${activeTheme}`);
    if (activeTheme !== "light") classes.push("dark");
  }

  return (
    <html lang="en" className={classes.join(" ")} suppressHydrationWarning>
      <head>
        <Script src="/scripts/theme-init.js" strategy="beforeInteractive" />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Next.js Boilerplate",
            description: "A battle-tested Next.js 16 boilerplate.",
            url: "https://next-js-boilerplate.vercel.app",
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="focus:bg-bg focus:text-fg focus:ring-brand sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2 focus:shadow-lg focus:ring-2 focus:outline-none"
        >
          Skip to content
        </a>
        <DeviceTypeInit />
        <Suspense fallback={null}>
          <EventLoggerInit />
        </Suspense>
        <PushNotificationInit />
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              <SessionBridge />
            </Suspense>
            <QueryProvider>
              <ToastProvider>
                <ClientLocaleProvider defaultMessages={messages}>
                  <TimezoneProvider>
                    <CurrencyProvider>
                      <DateDisplayProvider>{children}</DateDisplayProvider>
                    </CurrencyProvider>
                  </TimezoneProvider>
                </ClientLocaleProvider>
                <ToastViewport />
              </ToastProvider>
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
