"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { StepWizardOnboarding } from "./StepWizardOnboarding";
import { WelcomeDialogOnboarding } from "./WelcomeDialogOnboarding";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function OnboardingPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.onboarding;

  const examples: UIExample[] = [
    {
      id: "onboarding-1",
      title: t.onboarding1TabTitle,
      description: t.onboarding1TabDescription,
      render: () => <StepWizardOnboarding />,
    },
    {
      id: "onboarding-2",
      title: t.onboarding2TabTitle,
      description: t.onboarding2TabDescription,
      render: () => <WelcomeDialogOnboarding />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.onboardingTitle}
      intro={m.examples.onboardingDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="onboarding"
    />
  );
}
