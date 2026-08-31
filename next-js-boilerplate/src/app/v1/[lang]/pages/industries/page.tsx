import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import IndustriesPageContent from "@/views/pages/industries/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.industriesTitle,
    description: t.examples.industriesDescription,
  };
}

export default async function IndustriesPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <IndustriesPageContent initialTab={tab} initialFull={full === "1"} />;
}
