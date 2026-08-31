// Ported from next-js-boilerplate/src/app/v1/[lang]/posts/[uuid]/page.tsx
// The SSR post fetch + generateMetadata collapse into one loader.
import { createFileRoute, getRouteApi, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { metadataToHead } from "@/lib/head";
import { getTierView } from "@/lib/tier-view";
import { FreePageView } from "@/views/posts/uuid/FreePageView";
import { BasicPageView } from "@/views/posts/uuid/BasicPageView";
import { MediumPageView } from "@/views/posts/uuid/MediumPageView";
import { PremiumPageView } from "@/views/posts/uuid/PremiumPageView";
import { PostDetailFallback } from "@/fallbacks";

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

type PostMeta = {
  title: string;
  description?: string;
};

type Json =
  string | number | boolean | null | Array<Json> | { [key: string]: Json };

const getPostPageData = createServerFn()
  .validator((input: { uuid: string }) => input)
  .handler(async ({ data }): Promise<{ post: Json; meta: PostMeta }> => {
    const [
      { graphqlFetch, sessionTokenHeaders },
      { POST_QUERY },
      { getAccessToken },
    ] = await Promise.all([
      import("@/lib/backend"),
      import("@/lib/graphql/queries"),
      import("@/store/ssr-cookies"),
    ]);
    const token = await getAccessToken();
    const postRes = await graphqlFetch<{
      post: { title?: string; content?: string } | null;
    }>(POST_QUERY, { id: data.uuid }, token, await sessionTokenHeaders(), true);

    if (postRes.errors || !postRes.data?.post) {
      throw notFound();
    }
    const post = postRes.data.post;
    return {
      post: post as Json,
      meta: {
        title: post.title ?? "Post",
        description: post.content?.slice(0, 160) ?? "View post",
      },
    };
  });

const v1Route = getRouteApi("/v1/$lang");

export const Route = createFileRoute("/v1/$lang/posts/$uuid/")({
  loader: ({ params }) => getPostPageData({ data: { uuid: params.uuid } }),
  head: ({ loaderData }) =>
    metadataToHead(loaderData?.meta ?? { title: "Post" }),
  pendingComponent: PostDetailFallback,
  component: PostPage,
});

function PostPage() {
  const { user } = v1Route.useLoaderData();
  const { post } = Route.useLoaderData();
  return <>{getTierView(user.tier, VIEWS, { initialPostData: post })}</>;
}
