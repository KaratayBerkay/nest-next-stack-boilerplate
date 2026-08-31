import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import NewsletterPageContent from "@/views/pages/newsletter/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.newsletterTitle,
    description: t.examples.newsletterDescription,
  };
}

export default async function NewsletterPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <NewsletterPageContent initialTab={tab} initialFull={full === "1"} />;
}
