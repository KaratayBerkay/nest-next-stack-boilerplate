import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import CommunityPageContent from "@/views/pages/community/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.communityTitle,
    description: t.examples.communityDescription,
  };
}

export default async function CommunityPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <CommunityPageContent initialTab={tab} />;
}
