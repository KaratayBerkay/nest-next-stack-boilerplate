"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { MemberTableRoleSettingsMembers } from "./MemberTableRoleSettingsMembers";
import { MemberCardGridSettingsMembers } from "./MemberCardGridSettingsMembers";
import { PendingActiveTabsSettingsMembers } from "./PendingActiveTabsSettingsMembers";
import { RolePermissionMatrixSettingsMembers } from "./RolePermissionMatrixSettingsMembers";
import { BulkSelectToolbarSettingsMembers } from "./BulkSelectToolbarSettingsMembers";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function SettingsMembersPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.settingsMembers;

  const examples: UIExample[] = [
    {
      id: "settings-members-1",
      title: t.settingsMembers1TabTitle,
      description: t.settingsMembers1TabDescription,
      render: () => <MemberTableRoleSettingsMembers />,
    },
    {
      id: "settings-members-2",
      title: t.settingsMembers2TabTitle,
      description: t.settingsMembers2TabDescription,
      render: () => <MemberCardGridSettingsMembers />,
    },
    {
      id: "settings-members-3",
      title: t.settingsMembers3TabTitle,
      description: t.settingsMembers3TabDescription,
      render: () => <PendingActiveTabsSettingsMembers />,
    },
    {
      id: "settings-members-4",
      title: t.settingsMembers4TabTitle,
      description: t.settingsMembers4TabDescription,
      render: () => <RolePermissionMatrixSettingsMembers />,
    },
    {
      id: "settings-members-5",
      title: t.settingsMembers5TabTitle,
      description: t.settingsMembers5TabDescription,
      render: () => <BulkSelectToolbarSettingsMembers />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.settingsMembersTitle}
      intro={m.examples.settingsMembersDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="settings-members"
    />
  );
}
