import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ContentPageContent from "@/views/pages/content/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.contentTitle,
    description: t.examples.contentDescription,
  };
}

export default async function ContentPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <ContentPageContent initialTab={tab} initialFull={full === "1"} />;
}
