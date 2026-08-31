import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ProcessPageContent from "@/views/pages/process/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.processTitle,
    description: t.examples.processDescription,
  };
}

export default async function ProcessPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <ProcessPageContent initialTab={tab} initialFull={full === "1"} />;
}
