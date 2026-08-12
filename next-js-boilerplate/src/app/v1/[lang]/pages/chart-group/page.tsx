import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ChartGroupPageContent from "@/views/pages/chart-group/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.chartGroupTitle,
    description: t.examples.chartGroupDescription,
  };
}

export default async function ChartGroupPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <ChartGroupPageContent initialTab={tab} />;
}
