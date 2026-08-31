import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import ReviewsPageContent from "@/views/pages/reviews/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.reviewsTitle,
    description: t.examples.reviewsDescription,
  };
}

export default async function ReviewsPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <ReviewsPageContent initialTab={tab} initialFull={full === "1"} />;
}
