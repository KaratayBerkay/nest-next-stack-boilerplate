import type { Metadata } from "next";
import PageContent from "@/views/ui/avatar/PageContent";

export const metadata: Metadata = {
  title: "Avatar",
  description: "Avatar component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AvatarPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
