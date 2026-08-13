import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import DealsPageContent from "@/views/pages/deals/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.dealsTitle,
    description: t.examples.dealsDescription,
  };
}

export default async function DealsPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <DealsPageContent initialTab={tab} />;
}
