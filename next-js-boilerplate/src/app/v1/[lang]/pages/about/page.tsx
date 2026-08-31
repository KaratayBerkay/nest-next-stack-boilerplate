import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import PageContent from "@/views/pages/about/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.aboutTitle,
    description: t.examples.aboutDescription,
  };
}

export default async function AboutPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <PageContent initialTab={tab} initialFull={full === "1"} />;
}
