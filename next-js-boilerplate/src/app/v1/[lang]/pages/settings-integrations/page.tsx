import { getMessages } from "@/lib/i18n/get-messages";
import type { Lang } from "@/constants/i18n";
import SettingsIntegrationsPageContent from "@/views/pages/settings-integrations/PageContent";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string; full?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const t = getMessages(lang as Lang, "pages") as unknown as {
    examples: {
      settingsIntegrationsTitle: string;
      settingsIntegrationsDescription: string;
    };
  };
  return {
    title: t.examples.settingsIntegrationsTitle,
    description: t.examples.settingsIntegrationsDescription,
  };
}

export default async function SettingsIntegrationsPage({
  searchParams,
}: PageProps) {
  const { tab, full } = await searchParams;
  return (
    <SettingsIntegrationsPageContent
      initialTab={tab}
      initialFull={full === "1"}
    />
  );
}
