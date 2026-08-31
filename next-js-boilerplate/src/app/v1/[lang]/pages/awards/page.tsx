import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import AwardsPageContent from "@/views/pages/awards/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.awardsTitle,
    description: t.examples.awardsDescription,
  };
}

export default async function AwardsPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <AwardsPageContent initialTab={tab} initialFull={full === "1"} />;
}
