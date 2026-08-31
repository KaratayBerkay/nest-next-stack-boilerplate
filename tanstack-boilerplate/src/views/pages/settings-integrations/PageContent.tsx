"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { ConnectAppGridSettingsIntegrations } from "./ConnectAppGridSettingsIntegrations";
import { ConnectedAvailableSplitSettingsIntegrations } from "./ConnectedAvailableSplitSettingsIntegrations";
import { IntegrationStatusTableSettingsIntegrations } from "./IntegrationStatusTableSettingsIntegrations";
import { CategoryFilterPillsSettingsIntegrations } from "./CategoryFilterPillsSettingsIntegrations";
import { ConfigureDrawerListSettingsIntegrations } from "./ConfigureDrawerListSettingsIntegrations";
import { ActivityFeedIntegrationsSettingsIntegrations } from "./ActivityFeedIntegrationsSettingsIntegrations";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";
import type { PagesWithSettingsIntegrationsMessages } from "@/types/pages/settings-integrations/SettingsIntegrationsMessages-types";

export default function SettingsIntegrationsPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages") as unknown as PagesWithSettingsIntegrationsMessages & {
    examples: {
      settingsIntegrationsTitle: string;
      settingsIntegrationsDescription: string;
    };
  };
  const t = m.settingsIntegrations;

  const examples: UIExample[] = [
    {
      id: "settings-integrations-1",
      title: t.settingsIntegrations1TabTitle,
      description: t.settingsIntegrations1TabDescription,
      render: () => <ConnectAppGridSettingsIntegrations />,
    },
    {
      id: "settings-integrations-2",
      title: t.settingsIntegrations2TabTitle,
      description: t.settingsIntegrations2TabDescription,
      render: () => <ConnectedAvailableSplitSettingsIntegrations />,
    },
    {
      id: "settings-integrations-3",
      title: t.settingsIntegrations3TabTitle,
      description: t.settingsIntegrations3TabDescription,
      render: () => <IntegrationStatusTableSettingsIntegrations />,
    },
    {
      id: "settings-integrations-4",
      title: t.settingsIntegrations4TabTitle,
      description: t.settingsIntegrations4TabDescription,
      render: () => <CategoryFilterPillsSettingsIntegrations />,
    },
    {
      id: "settings-integrations-5",
      title: t.settingsIntegrations5TabTitle,
      description: t.settingsIntegrations5TabDescription,
      render: () => <ConfigureDrawerListSettingsIntegrations />,
    },
    {
      id: "settings-integrations-6",
      title: t.settingsIntegrations6TabTitle,
      description: t.settingsIntegrations6TabDescription,
      render: () => <ActivityFeedIntegrationsSettingsIntegrations />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.settingsIntegrationsTitle}
      intro={m.examples.settingsIntegrationsDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="settings-integrations"
    />
  );
}
