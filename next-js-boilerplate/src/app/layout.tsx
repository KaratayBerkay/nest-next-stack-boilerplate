import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { JsonLd } from "@/lib/seo/JsonLd";
import { QueryProvider } from "@/integrations/tanstack-query/QueryProvider";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { DeviceTypeInit } from "@/components/DeviceTypeInit";
import { EventLoggerInit } from "@/components/EventLoggerInit";
import { PushNotificationInit } from "@/components/PushNotificationInit";
import { SessionScript } from "@/components/SessionScript";
import {
  ToastProvider,
  ToastViewport,
} from "@/components/ui/Toast";
import { MessagesProvider } from "@/lib/i18n/MessagesProvider";
import { getAllMessages } from "@/lib/i18n/get-all-messages";
import { DEFAULT_LANG } from "@/constants/i18n";
import type { I18nMessages } from "@/generated/i18n-messages";
import { ThemeInitScript } from "./ThemeInitScript";
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
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f0f0f",
};

export const metadata: Metadata = {
  title: {
    default: "Next.js Boilerplate",
    template: "%s — Next.js Boilerplate",
  },
  description: "A battle-tested Next.js 16 boilerplate.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = getAllMessages<I18nMessages>(DEFAULT_LANG);
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeInitScript />
      </head>
      <body className="flex min-h-full flex-col">
        <DeviceTypeInit />
        <Suspense fallback={null}>
          <EventLoggerInit />
        </Suspense>
        <PushNotificationInit />
        <ThemeProvider>
          <Suspense fallback={null}>
            <SessionScript />
          </Suspense>
          <AuthProvider>
            <QueryProvider>
              <ToastProvider>
                <MessagesProvider messages={messages}>
                  {children}
                </MessagesProvider>
                <ToastViewport />
              </ToastProvider>
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Next.js Boilerplate",
            description: "A battle-tested Next.js 16 boilerplate.",
            url: "https://next-js-boilerplate.vercel.app",
          }}
        />
      </body>
    </html>
  );
}
