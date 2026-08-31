import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import CrudCompaniesPageContent from "@/views/pages/crud-companies/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.crudCompaniesTitle,
    description: t.examples.crudCompaniesDescription,
  };
}

export default async function CrudCompaniesPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return (
    <CrudCompaniesPageContent initialTab={tab} initialFull={full === "1"} />
  );
}
