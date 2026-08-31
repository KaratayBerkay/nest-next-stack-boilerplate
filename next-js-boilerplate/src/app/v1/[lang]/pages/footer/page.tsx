import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import FooterPageContent from "@/views/pages/footer/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.footerTitle,
    description: t.examples.footerDescription,
  };
}

export default async function FooterPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <FooterPageContent initialTab={tab} initialFull={full === "1"} />;
}
