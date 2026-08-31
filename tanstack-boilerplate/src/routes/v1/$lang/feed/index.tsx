// Ported from next-js-boilerplate/src/app/v1/[lang]/feed/page.tsx
// The SSR first-page feed fetch moves into a server-function loader.
import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import type { Metadata } from "next";
import { createServerFn } from "@tanstack/react-start";
import { metadataToHead } from "@/lib/head";
import { getTierView } from "@/lib/tier-view";
import { FreePageView } from "@/views/feed/FreePageView";
import { BasicPageView } from "@/views/feed/BasicPageView";
import { MediumPageView } from "@/views/feed/MediumPageView";
import { PremiumPageView } from "@/views/feed/PremiumPageView";
import { FeedLoadingFallback } from "@/fallbacks";

export const metadata: Metadata = {
  title: "Feed",
  description: "Your social feed",
};

const PAGE_SIZE = 5;

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

interface InitialFeedData {
  posts: Array<{ id: string }>;
  hasMore: boolean;
  nextCursor: string | null;
}

const getInitialFeed = createServerFn().handler(
  async (): Promise<InitialFeedData> => {
    const [
      { graphqlFetch, sessionTokenHeaders },
      { POSTS_QUERY },
      { getAccessToken },
    ] = await Promise.all([
      import("@/lib/backend"),
      import("@/lib/graphql/queries"),
      import("@/store/ssr-cookies"),
    ]);
    const token = await getAccessToken();
    const feedRes = await graphqlFetch<{ postList: Array<{ id: string }> }>(
      POSTS_QUERY,
      { cursor: undefined, take: PAGE_SIZE, search: undefined },
      token,
      await sessionTokenHeaders(),
      true,
    );
    const all = feedRes.data?.postList ?? [];
    const hasMore = all.length > PAGE_SIZE;
    const posts = hasMore ? all.slice(0, PAGE_SIZE) : all;
    const nextCursor = hasMore ? (posts[posts.length - 1]?.id ?? null) : null;
    return { posts, hasMore, nextCursor };
  },
);

const v1Route = getRouteApi("/v1/$lang");

export const Route = createFileRoute("/v1/$lang/feed/")({
  loader: () => getInitialFeed(),
  head: () => metadataToHead(metadata),
  pendingComponent: FeedLoadingFallback,
  component: FeedPage,
});

function FeedPage() {
  const { user } = v1Route.useLoaderData();
  const initialFeedData = Route.useLoaderData();
  return <>{getTierView(user.tier, VIEWS, { initialFeedData })}</>;
}
