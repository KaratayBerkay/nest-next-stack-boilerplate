import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import HelpCenterPageContent from "@/views/pages/help-center/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.helpCenterTitle,
    description: t.examples.helpCenterDescription,
  };
}

export default async function HelpCenterPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <HelpCenterPageContent initialTab={tab} initialFull={full === "1"} />;
}
