"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { CheckboxPreferenceListSettingsNotifications } from "./CheckboxPreferenceListSettingsNotifications";
import { SwitchPanelSettingsNotifications } from "./SwitchPanelSettingsNotifications";
import { GroupedAccordionSettingsNotifications } from "./GroupedAccordionSettingsNotifications";
import { ChannelMatrixTableSettingsNotifications } from "./ChannelMatrixTableSettingsNotifications";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function SettingsNotificationsPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.settingsNotifications;

  const examples: UIExample[] = [
    {
      id: "settings-notifications-1",
      title: t.settingsNotifications1TabTitle,
      description: t.settingsNotifications1TabDescription,
      render: () => <CheckboxPreferenceListSettingsNotifications />,
    },
    {
      id: "settings-notifications-2",
      title: t.settingsNotifications2TabTitle,
      description: t.settingsNotifications2TabDescription,
      render: () => <SwitchPanelSettingsNotifications />,
    },
    {
      id: "settings-notifications-3",
      title: t.settingsNotifications3TabTitle,
      description: t.settingsNotifications3TabDescription,
      render: () => <GroupedAccordionSettingsNotifications />,
    },
    {
      id: "settings-notifications-4",
      title: t.settingsNotifications4TabTitle,
      description: t.settingsNotifications4TabDescription,
      render: () => <ChannelMatrixTableSettingsNotifications />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.settingsNotificationsTitle}
      intro={m.examples.settingsNotificationsDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="settings-notifications"
    />
  );
}
