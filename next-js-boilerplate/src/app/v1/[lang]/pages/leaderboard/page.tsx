import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import LeaderboardPageContent from "@/views/pages/leaderboard/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.leaderboardTitle,
    description: t.examples.leaderboardDescription,
  };
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return <LeaderboardPageContent initialTab={tab} initialFull={full === "1"} />;
}
