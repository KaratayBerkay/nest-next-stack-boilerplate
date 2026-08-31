import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import SocialMediaTrendingPageContent from "@/views/pages/social-media-trending/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages") as unknown as {
    examples: {
      socialMediaTrendingTitle: string;
      socialMediaTrendingDescription: string;
    };
  };
  return {
    title: t.examples.socialMediaTrendingTitle,
    description: t.examples.socialMediaTrendingDescription,
  };
}

export default async function SocialMediaTrendingPage({
  searchParams,
}: PageProps) {
  const { tab, full } = await searchParams;
  return (
    <SocialMediaTrendingPageContent
      initialTab={tab}
      initialFull={full === "1"}
    />
  );
}
