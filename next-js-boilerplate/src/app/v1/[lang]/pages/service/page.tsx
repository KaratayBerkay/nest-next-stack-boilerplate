import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ServicePageContent from "@/views/pages/service/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.serviceTitle,
    description: t.examples.serviceDescription,
  };
}

export default async function ServicePage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <ServicePageContent initialTab={tab} initialFull={full === "1"} />;
}
