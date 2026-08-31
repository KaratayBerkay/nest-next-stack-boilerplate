import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ResourcePageContent from "@/views/pages/resource/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.resourceTitle,
    description: t.examples.resourceDescription,
  };
}

export default async function ResourcePage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <ResourcePageContent initialTab={tab} initialFull={full === "1"} />;
}
