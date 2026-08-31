import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import FeedbackPageContent from "@/views/pages/feedback/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.feedbackTitle,
    description: t.examples.feedbackDescription,
  };
}

export default async function FeedbackPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <FeedbackPageContent initialTab={tab} initialFull={full === "1"} />;
}
