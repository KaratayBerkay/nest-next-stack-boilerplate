import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import SidebarPageContent from "@/views/pages/sidebar/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.sidebarTitle,
    description: t.examples.sidebarDescription,
  };
}

export default async function SidebarPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <SidebarPageContent initialTab={tab} initialFull={full === "1"} />;
}
