// Ported from next-js-boilerplate/src/app/v1/[lang]/users/detail/[uuid]/page.tsx
import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { FreePageView } from "@/views/users/detail/uuid/FreePageView";

export const metadata: Metadata = {
  title: "User Profile",
  description: "View user profile",
};

const v1Route = getRouteApi("/v1/$lang");

export const Route = createFileRoute("/v1/$lang/users/detail/$uuid/")({
  head: () => metadataToHead(metadata),
  component: UserDetailPage,
});

function UserDetailPage() {
  const { messages } = v1Route.useLoaderData();
  const { lang, uuid } = Route.useParams();
  return <FreePageView t={messages.users} params={{ lang, uuid }} />;
}
