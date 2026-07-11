import type { Metadata } from "next";
import { getTierView } from "@/lib/tier-view";
import { getSessionUser } from "@/lib/auth-ssr";
import { FreePageView } from "@/views/posts/[uuid]/FreePageView";
import { BasicPageView } from "@/views/posts/[uuid]/BasicPageView";
import { MediumPageView } from "@/views/posts/[uuid]/MediumPageView";
import { PremiumPageView } from "@/views/posts/[uuid]/PremiumPageView";

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

interface PageProps {
  params: Promise<{ lang: string; uuid: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { uuid } = await params;
  try {
    const res = await fetch(
      `${process.env.APP_URL ?? "http://localhost:3000"}/api/posts/${uuid}`,
      { cache: "no-store" },
    );
    const data = await res.json();
    const post = data?.post;
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
