import type { Metadata } from "next";
import { getTierView } from "@/lib/tier-view";
import { getSessionUser } from "@/lib/auth-ssr";
import { FreePageView } from "@/views/posts/[uuid]/FreePageView";
import { BasicPageView } from "@/views/posts/[uuid]/BasicPageView";
import { MediumPageView } from "@/views/posts/[uuid]/MediumPageView";
import { PremiumPageView } from "@/views/posts/[uuid]/PremiumPageView";

export const metadata: Metadata = {
  title: "Post",
  description: "View post",
};

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

export default async function PostPage() {
  const user = await getSessionUser();

  return getTierView(user!.tier, VIEWS);
}
