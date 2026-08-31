// Root route — the port of src/app/layout.tsx from the Next.js app.
// The document shell, global providers, i18n default messages, and the
// SSR theme class (from the `theme` cookie) all live here.

import { Suspense } from "react";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { JsonLd } from "@/lib/seo/JsonLd";
import { QueryProvider } from "@/integrations/tanstack-query/QueryProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { DeviceTypeInit } from "@/components/DeviceTypeInit";
import { EventLoggerInit } from "@/components/EventLoggerInit";
import { PushNotificationInit } from "@/components/PushNotificationInit";
import { SessionBridge } from "@/components/SessionBridge";
import { ToastProvider, ToastViewport } from "@/components/ui/Toast";
import { DEFAULT_LANG } from "@/constants/i18n";
import type { I18nMessages } from "@/generated/i18n-messages";
import type { User } from "@/types/auth/User";
import { ClientLocaleProvider } from "@/components/ClientLocaleProvider";
import { TimezoneProvider } from "@/components/TimezoneProvider";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { DateDisplayProvider } from "@/components/DateDisplayProvider";
import { SITE_NAME } from "@/lib/head";
// Side-effect imports, NOT `?url` + manual <link>: a `?url` specifier is
// resolved independently by the client and the SSR build, and the two can
// emit DIFFERENT content hashes for the same file (Tailwind scans each
// build's own module graph — the server graph sees server-only files, so
// its generated utilities differ). The SSR HTML then links a hash that the
// client build never emitted → 404 → the page paints unstyled until
// hydration injects chunk CSS ("css loads after the page"). Side-effect
// imports let the Start plugin resolve the stylesheet links from the client
// manifest at render time — one source of truth for the hash.
import "@/styles/fonts.css";
import "@/styles/globals.css";

const THEME_NAMES = [
  "light",
  "dark",
  "moonnote",
  "shiny",
  "glass",
  "neon",
  "gradient",
] as const;

type ThemeName = (typeof THEME_NAMES)[number];

interface RootLoaderData {
  messages: I18nMessages;
  activeTheme: ThemeName | null;
  sessionUser: User | null;
  accessToken: string | null;
}

const getRootData = createServerFn().handler(
  async (): Promise<RootLoaderData> => {
    const [
      { getAllMessages },
      { getCookie },
      { getSessionUser },
      { getAccessToken },
    ] = await Promise.all([
      import("@/lib/i18n/get-all-messages"),
      import("@tanstack/react-start/server"),
      import("@/lib/auth-ssr"),
      import("@/store/ssr-cookies"),
    ]);
    const messages = getAllMessages<I18nMessages>(DEFAULT_LANG);
    const themeCookie = getCookie("theme");
    const activeTheme =
      themeCookie && THEME_NAMES.includes(themeCookie as ThemeName)
        ? (themeCookie as ThemeName)
        : null;
    const sessionUser = await getSessionUser();
    const accessToken = sessionUser ? ((await getAccessToken()) ?? null) : null;
    return { messages, activeTheme, sessionUser, accessToken };
  },
);

export const Route = createRootRoute({
  loader: () => getRootData(),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=5",
      },
      { name: "theme-color", content: "#0f0f0f" },
      { title: SITE_NAME },
      {
        name: "description",
        content: "A battle-tested TanStack Start boilerplate.",
      },
    ],
    links: [
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", href: "/favicon.ico" },
    ],
    scripts: [{ src: "/scripts/theme-init.js" }],
  }),
  shellComponent: RootDocument,
  component: RootComponent,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const activeTheme = useRouterState({
    select: (state) =>
      (
        state.matches.find((match) => match.routeId === "__root__")
          ?.loaderData as RootLoaderData | undefined
      )?.activeTheme ?? null,
  });

  const classes = ["h-full antialiased"];
  if (activeTheme) {
    classes.push(`style-${activeTheme}`);
    if (activeTheme !== "light") classes.push("dark");
  }

  return (
    <html lang="en" className={classes.join(" ")} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { messages, sessionUser, accessToken } = Route.useLoaderData();

  return (
    <>
      <a
        href="#main-content"
        className="focus:bg-bg focus:text-fg focus:ring-brand sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2 focus:shadow-lg focus:ring-2 focus:outline-none"
      >
        Skip to content
      </a>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          description: "A battle-tested TanStack Start boilerplate.",
          url: "https://tanstack-boilerplate.example.com",
        }}
      />
      <DeviceTypeInit />
      <Suspense fallback={null}>
        <EventLoggerInit />
      </Suspense>
      <PushNotificationInit />
      <ThemeProvider>
        <AuthProvider>
          <Suspense fallback={null}>
            <SessionBridge user={sessionUser} token={accessToken} />
          </Suspense>
          <QueryProvider>
            <ToastProvider>
              <ClientLocaleProvider defaultMessages={messages}>
                <TimezoneProvider>
                  <CurrencyProvider>
                    <DateDisplayProvider>
                      <Outlet />
                    </DateDisplayProvider>
                  </CurrencyProvider>
                </TimezoneProvider>
              </ClientLocaleProvider>
              <ToastViewport />
            </ToastProvider>
          </QueryProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}
