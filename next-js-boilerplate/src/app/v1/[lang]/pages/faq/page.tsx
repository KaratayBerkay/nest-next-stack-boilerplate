import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import FaqPageContent from "@/views/pages/faq/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.faqTitle,
    description: t.examples.faqDescription,
  };
}

export default async function FaqPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <FaqPageContent initialTab={tab} />;
}
