import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import FieldMappingPageContent from "@/views/pages/field-mapping/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.fieldMappingTitle,
    description: t.examples.fieldMappingDescription,
  };
}

export default async function FieldMappingPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return (
    <FieldMappingPageContent initialTab={tab} initialFull={full === "1"} />
  );
}
