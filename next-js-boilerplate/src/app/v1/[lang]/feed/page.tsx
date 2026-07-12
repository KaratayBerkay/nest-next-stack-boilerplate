import type { Metadata } from "next";
import { getTierView } from "@/lib/tier-view";
import { getSessionUser } from "@/lib/auth-ssr";
import { graphqlFetch } from "@/lib/backend";
import { POSTS_QUERY } from "@/lib/graphql/queries";
import { FreePageView } from "@/views/feed/FreePageView";
import { BasicPageView } from "@/views/feed/BasicPageView";
import { MediumPageView } from "@/views/feed/MediumPageView";
import { PremiumPageView } from "@/views/feed/PremiumPageView";

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

export default async function FeedPage() {
  const [user, feedRes] = await Promise.all([
    getSessionUser(),
    graphqlFetch<{ postList: Array<{ id: string }> }>(POSTS_QUERY, {
      cursor: undefined,
      take: PAGE_SIZE,
      search: undefined,
    }).catch(() => ({ data: undefined, errors: undefined, headers: new Headers() })),
  ]);

  const all = feedRes.data?.postList ?? [];
  const hasMore = all.length > PAGE_SIZE;
  const posts = hasMore ? all.slice(0, PAGE_SIZE) : all;
  const nextCursor = hasMore ? posts[posts.length - 1]?.id : null;

  return getTierView(user!.tier, VIEWS, {
    initialFeedData: { posts, hasMore, nextCursor },
  });
}
