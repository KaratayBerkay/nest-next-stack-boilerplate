// Ported from next-js-boilerplate/src/app/v1/lang/layout.tsx
// (+ error.tsx, not-found.tsx, loading.tsx from the same segment).
// The loader authenticates the session server-side (redirecting to login on
// a dead session) and ships the locale's full message tree; child routes read
// both via getRouteApi("/v1/$lang").useLoaderData().

import { Suspense, useEffect } from "react";
import {
  Outlet,
  createFileRoute,
  redirect,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { MessagesProvider, useMessages } from "@/lib/i18n/MessagesProvider";
import type { I18nMessages } from "@/generated/i18n-messages";
import { V1Shell } from "@/views/v1/lang/V1Shell";
import { PageNavWrapper } from "@/views/v1/lang/PageNavWrapper";
import { AuthProvider } from "@/hooks/useAuth";
import { LOGIN_PATH } from "@/constants/routes";
import { V1ShellFallback, V1ContentFallback } from "@/fallbacks";
import { ErrorPage, NotFoundPage } from "@/features/statics";
import { eventLogger } from "@/lib/event-logger";
import type { User } from "@/types/auth/User";

interface V1LayoutData {
  user: User;
  messages: I18nMessages;
}

const getV1LayoutData = createServerFn()
  .validator((input: { lang: string }) => input)
  .handler(async ({ data }): Promise<V1LayoutData> => {
    const [{ getSessionUser }, { getAllMessages }] = await Promise.all([
      import("@/lib/auth-ssr"),
      import("@/lib/i18n/get-all-messages"),
    ]);
    const user = await getSessionUser();
    if (!user) throw redirect({ href: LOGIN_PATH });
    const messages = getAllMessages<I18nMessages>(data.lang);
    return { user, messages };
  });

export const Route = createFileRoute("/v1/$lang")({
  loader: ({ params }) => getV1LayoutData({ data: { lang: params.lang } }),
  component: V1Layout,
  pendingComponent: V1ShellFallback,
  errorComponent: V1Error,
  notFoundComponent: V1NotFound,
});

function V1Layout() {
  const { user, messages } = Route.useLoaderData();

  return (
    <AuthProvider initialUser={user}>
      <MessagesProvider messages={messages}>
        <main id="main-content" className="flex w-full flex-1 flex-col">
          <Suspense fallback={<V1ShellFallback />}>
            <V1Shell>
              <Suspense fallback={<V1ContentFallback />}>
                <PageNavWrapper>
                  <Outlet />
                </PageNavWrapper>
              </Suspense>
            </V1Shell>
          </Suspense>
        </main>
      </MessagesProvider>
    </AuthProvider>
  );
}

function V1Error({ error, reset }: ErrorComponentProps) {
  useEffect(() => {
    console.error("[v1] segment error:", error);
    // Route-boundary errors don't reach window.onerror (React swallows them
    // before they bubble), so useEventLogger's global handler never sees
    // these — this is the only place they can ship to the pipeline.
    eventLogger.emit({
      eventType: "exception",
      url: window.location.pathname,
      category: "application-exception",
      event: "segment.error",
      exceptionType: "CLIENT_ERROR",
      metadata: {
        message: error.message,
        digest: (error as Error & { digest?: string }).digest,
        stack: error.stack,
      },
    });
  }, [error]);

  return (
    <div
      data-testid="error-boundary"
      className="surface flex flex-col gap-2 p-5"
    >
      <ErrorPage error={error} reset={reset} />
    </div>
  );
}

function V1NotFound() {
  const t = useMessages("error");
  return (
    <div data-testid="not-found" className="surface flex flex-col gap-2 p-5">
      <NotFoundPage
        title={t.notFound}
        description={t.v1NotFound}
        backLabel={t.backToV1}
        backHref="/v1"
      />
    </div>
  );
}
