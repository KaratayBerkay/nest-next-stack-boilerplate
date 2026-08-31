import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import TestimonialPageContent from "@/views/pages/testimonial/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages") as unknown as {
    examples: {
      testimonialTitle: string;
      testimonialDescription: string;
    };
  };
  return {
    title: t.examples.testimonialTitle,
    description: t.examples.testimonialDescription,
  };
}

export default async function TestimonialPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <TestimonialPageContent initialTab={tab} initialFull={full === "1"} />;
}
