// Ported from next-js-boilerplate/src/app/v1/[lang]/users/list/page.tsx
// The `users` dictionary comes from the v1 layout's loader data.
import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { FreePageView } from "@/views/users/list/FreePageView";
import type { Lang } from "@/constants/i18n";

export const metadata: Metadata = {
  title: "Users",
  description: "Browse users",
};

const v1Route = getRouteApi("/v1/$lang");

export const Route = createFileRoute("/v1/$lang/users/list/")({
  head: () => metadataToHead(metadata),
  component: UsersListPage,
});

function UsersListPage() {
  const { messages } = v1Route.useLoaderData();
  const { lang } = Route.useParams();
  return <FreePageView t={messages.users} lang={lang as Lang} />;
}
