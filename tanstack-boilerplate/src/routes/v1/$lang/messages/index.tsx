// Ported from next-js-boilerplate/src/app/v1/[lang]/messages/page.tsx
// (+ messages/error.tsx and messages/loading.tsx boundaries)
import {
  createFileRoute,
  getRouteApi,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import type { Metadata } from "next";
import { createServerFn } from "@tanstack/react-start";
import { metadataToHead } from "@/lib/head";
import { getTierView } from "@/lib/tier-view";
import { FreePageView } from "@/views/messages/FreePageView";
import { BasicPageView } from "@/views/messages/BasicPageView";
import { MediumPageView } from "@/views/messages/MediumPageView";
import { PremiumPageView } from "@/views/messages/PremiumPageView";
import { MessagesLoadingFallback } from "@/fallbacks";
import { ErrorPage } from "@/features/statics";

export const metadata: Metadata = {
  title: "Messages",
  description: "Your messages",
};

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

interface InitialFriend {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

const getInitialFriends = createServerFn().handler(
  async (): Promise<Array<InitialFriend>> => {
    try {
      const [{ backendFetch }, { FRIENDS_URL }] = await Promise.all([
        import("@/lib/backend"),
        import("@/constants/api/urls"),
      ]);
      const res = await backendFetch(FRIENDS_URL);
      if (res.ok) return res.data as Array<InitialFriend>;
    } catch {
      // SSR friends preload is best-effort.
    }
    return [];
  },
);

const v1Route = getRouteApi("/v1/$lang");

export const Route = createFileRoute("/v1/$lang/messages/")({
  validateSearch: (search: Record<string, unknown>): { user?: string } => ({
    user: typeof search.user === "string" ? search.user : undefined,
  }),
  loader: () => getInitialFriends(),
  head: () => metadataToHead(metadata),
  pendingComponent: MessagesLoadingFallback,
  errorComponent: MessagesError,
  component: MessagesPage,
});

function MessagesPage() {
  const { user } = v1Route.useLoaderData();
  const initialFriends = Route.useLoaderData();
  const search = Route.useSearch();
  return (
    <>
      {getTierView(user.tier, VIEWS, {
        initialUser: search.user || null,
        initialFriends,
      })}
    </>
  );
}

function MessagesError({ error, reset }: ErrorComponentProps) {
  return <ErrorPage error={error} reset={reset} />;
}
