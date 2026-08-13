import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import DataTablePageContent from "@/views/pages/data-table/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.dataTableTitle,
    description: t.examples.dataTableDescription,
  };
}

export default async function DataTablePage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <DataTablePageContent initialTab={tab} />;
}
