import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import CaseStudiesPageContent from "@/views/pages/case-studies/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.caseStudiesTitle,
    description: t.examples.caseStudiesDescription,
  };
}

export default async function CaseStudiesPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <CaseStudiesPageContent initialTab={tab} />;
}
