import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import TrustStripPageContent from "@/views/pages/trust-strip/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.trustStripTitle,
    description: t.examples.trustStripDescription,
  };
}

export default async function TrustStripPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <TrustStripPageContent initialTab={tab} initialFull={full === "1"} />;
}
