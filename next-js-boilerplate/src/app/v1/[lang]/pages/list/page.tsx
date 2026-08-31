import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ListPageContent from "@/views/pages/list/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.listTitle,
    description: t.examples.listDescription,
  };
}

export default async function ListPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <ListPageContent initialTab={tab} initialFull={full === "1"} />;
}
