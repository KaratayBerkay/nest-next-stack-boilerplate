import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import SettingsProfilePageContent from "@/views/pages/settings-profile/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.settingsProfileTitle,
    description: t.examples.settingsProfileDescription,
  };
}

export default async function SettingsProfilePage({ searchParams }: PageProps) {
  const { tab, full } = await searchParams;
  return (
    <SettingsProfilePageContent initialTab={tab} initialFull={full === "1"} />
  );
}
