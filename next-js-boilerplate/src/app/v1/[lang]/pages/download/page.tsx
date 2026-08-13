import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import DownloadPageContent from "@/views/pages/download/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.downloadTitle,
    description: t.examples.downloadDescription,
  };
}

export default async function DownloadPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <DownloadPageContent initialTab={tab} />;
}
