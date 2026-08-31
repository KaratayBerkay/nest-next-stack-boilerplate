import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import DashboardPageContent from "@/views/pages/dashboard/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.dashboardTitle,
    description: t.examples.dashboardDescription,
  };
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <DashboardPageContent initialTab={tab} initialFull={full === "1"} />;
}
