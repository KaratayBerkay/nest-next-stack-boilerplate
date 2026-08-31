import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import CookieBannerPageContent from "@/views/pages/cookie-banner/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.cookieBannerTitle,
    description: t.examples.cookieBannerDescription,
  };
}

export default async function CookieBannerPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return (
    <CookieBannerPageContent initialTab={tab} initialFull={full === "1"} />
  );
}
