import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import SettingsNotificationsPageContent from "@/views/pages/settings-notifications/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages");
  return {
    title: t.examples.settingsNotificationsTitle,
    description: t.examples.settingsNotificationsDescription,
  };
}

export default async function SettingsNotificationsPage({
  searchParams,
}: PageProps) {
  const { tab, full } = await searchParams;
  return (
    <SettingsNotificationsPageContent
      initialTab={tab}
      initialFull={full === "1"}
    />
  );
}
