import type { Metadata } from "next";
import { getTierView } from "@/lib/tier-view";
import { getSessionUser } from "@/lib/auth-ssr";
import { FreePageView } from "@/views/posts/[uuid]/FreePageView";
import { BasicPageView } from "@/views/posts/[uuid]/BasicPageView";
import { MediumPageView } from "@/views/posts/[uuid]/MediumPageView";
import { PremiumPageView } from "@/views/posts/[uuid]/PremiumPageView";
import type { PostPageProps } from "@/types/routing/PostPage-types";
import { serverEnv } from "@/lib/env";

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { uuid } = await params;
  try {
    const backendUrl = serverEnv().APP_URL;
    const gqlQuery = JSON.stringify({
      query: `query Post($id: ID!) { post(id: $id) { title content } }`,
      variables: { id: uuid },
    });
    const res = await fetch(`${backendUrl}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: gqlQuery,
      cache: "no-store",
    });
    const data = await res.json();
    const post = data?.data?.post;
    if (!post) return { title: "Post" };
    return {
      title: post.title ?? "Post",
      description: post.content?.slice(0, 160) ?? "View post",
    };
  } catch {
    return { title: "Post" };
  }
}

export default async function PostPage() {
  const user = await getSessionUser();

  return getTierView(user!.tier, VIEWS);
}
