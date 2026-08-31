import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import MagicLinkPageContent from "@/views/pages/magic-link/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.magicLinkTitle,
    description: t.examples.magicLinkDescription,
  };
}

export default async function MagicLinkPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <MagicLinkPageContent initialTab={tab} initialFull={full === "1"} />;
}
