import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import CareersPageContent from "@/views/pages/careers/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.careersTitle,
    description: t.examples.careersDescription,
  };
}

export default async function CareersPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <CareersPageContent initialTab={tab} initialFull={full === "1"} />;
}
