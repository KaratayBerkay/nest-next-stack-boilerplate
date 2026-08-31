import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import LogosPageContent from "@/views/pages/logos/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.logosTitle,
    description: t.examples.logosDescription,
  };
}

export default async function LogosPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <LogosPageContent initialTab={tab} initialFull={full === "1"} />;
}
