import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import BookADemoPageContent from "@/views/pages/book-a-demo/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.bookADemoTitle,
    description: t.examples.bookADemoDescription,
  };
}

export default async function BookADemoPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <BookADemoPageContent initialTab={tab} initialFull={full === "1"} />;
}
