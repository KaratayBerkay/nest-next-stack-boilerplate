import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import BentoPageContent from "@/views/pages/bento/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.bentoTitle,
    description: t.examples.bentoDescription,
  };
}

export default async function BentoPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <BentoPageContent initialTab={tab} initialFull={full === "1"} />;
}
