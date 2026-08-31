import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import IntegrationPageContent from "@/views/pages/integration/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.integrationTitle,
    description: t.examples.integrationDescription,
  };
}

export default async function IntegrationPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <IntegrationPageContent initialTab={tab} initialFull={full === "1"} />;
}
