import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import PageContent from "@/views/forms/filters/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "forms");
  return {
    title: t.examples.filtersTitle,
    description: t.examples.filtersDescription,
  };
}

export default async function FiltersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return <PageContent initialSearchParams={sp} />;
}
