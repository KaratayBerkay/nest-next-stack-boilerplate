import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import CaseStudyPageContent from "@/views/pages/case-study/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.caseStudyTitle,
    description: t.examples.caseStudyDescription,
  };
}

export default async function CaseStudyPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <CaseStudyPageContent initialTab={tab} initialFull={full === "1"} />;
}
