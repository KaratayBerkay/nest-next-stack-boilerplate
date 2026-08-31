"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { CoverHeaderSettingsProfile } from "./CoverHeaderSettingsProfile";
import { CenteredAvatarCardSettingsProfile } from "./CenteredAvatarCardSettingsProfile";
import { LivePreviewSplitSettingsProfile } from "./LivePreviewSplitSettingsProfile";
import { TabbedSectionsSettingsProfile } from "./TabbedSectionsSettingsProfile";
import { SidebarNavShellSettingsProfile } from "./SidebarNavShellSettingsProfile";
import { InlineEditFieldsListSettingsProfile } from "./InlineEditFieldsListSettingsProfile";
import { DangerZoneSettingsProfile } from "./DangerZoneSettingsProfile";
import { SocialLinksManagerSettingsProfile } from "./SocialLinksManagerSettingsProfile";
import { StepperWizardSettingsProfile } from "./StepperWizardSettingsProfile";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function SettingsProfilePageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.settingsProfile;

  const examples: UIExample[] = [
    {
      id: "settings-profile-1",
      title: t.settingsProfile1TabTitle,
      description: t.settingsProfile1TabDescription,
      render: () => <CoverHeaderSettingsProfile />,
    },
    {
      id: "settings-profile-2",
      title: t.settingsProfile2TabTitle,
      description: t.settingsProfile2TabDescription,
      render: () => <CenteredAvatarCardSettingsProfile />,
    },
    {
      id: "settings-profile-3",
      title: t.settingsProfile3TabTitle,
      description: t.settingsProfile3TabDescription,
      render: () => <LivePreviewSplitSettingsProfile />,
    },
    {
      id: "settings-profile-4",
      title: t.settingsProfile4TabTitle,
      description: t.settingsProfile4TabDescription,
      render: () => <TabbedSectionsSettingsProfile />,
    },
    {
      id: "settings-profile-5",
      title: t.settingsProfile5TabTitle,
      description: t.settingsProfile5TabDescription,
      render: () => <SidebarNavShellSettingsProfile />,
    },
    {
      id: "settings-profile-6",
      title: t.settingsProfile6TabTitle,
      description: t.settingsProfile6TabDescription,
      render: () => <InlineEditFieldsListSettingsProfile />,
    },
    {
      id: "settings-profile-7",
      title: t.settingsProfile7TabTitle,
      description: t.settingsProfile7TabDescription,
      render: () => <DangerZoneSettingsProfile />,
    },
    {
      id: "settings-profile-8",
      title: t.settingsProfile8TabTitle,
      description: t.settingsProfile8TabDescription,
      render: () => <SocialLinksManagerSettingsProfile />,
    },
    {
      id: "settings-profile-9",
      title: t.settingsProfile9TabTitle,
      description: t.settingsProfile9TabDescription,
      render: () => <StepperWizardSettingsProfile />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.settingsProfileTitle}
      intro={m.examples.settingsProfileDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="settings-profile"
    />
  );
}
