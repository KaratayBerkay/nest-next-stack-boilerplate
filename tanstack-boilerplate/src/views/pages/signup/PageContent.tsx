"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { CenteredCardSocialSignup } from "./CenteredCardSocialSignup";
import { MultiStepWizardSignup } from "./MultiStepWizardSignup";
import { PlanSelectSignup } from "./PlanSelectSignup";
import { SplitImageChecklistSignup } from "./SplitImageChecklistSignup";
import { MinimalRevealSignup } from "./MinimalRevealSignup";
import { PasswordStrengthSignup } from "./PasswordStrengthSignup";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function SignupPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.signup;

  const examples: UIExample[] = [
    {
      id: "signup-1",
      title: t.signup1TabTitle,
      description: t.signup1TabDescription,
      render: () => <CenteredCardSocialSignup />,
    },
    {
      id: "signup-2",
      title: t.signup2TabTitle,
      description: t.signup2TabDescription,
      render: () => <MultiStepWizardSignup />,
    },
    {
      id: "signup-3",
      title: t.signup3TabTitle,
      description: t.signup3TabDescription,
      render: () => <PlanSelectSignup />,
    },
    {
      id: "signup-4",
      title: t.signup4TabTitle,
      description: t.signup4TabDescription,
      render: () => <SplitImageChecklistSignup />,
    },
    {
      id: "signup-5",
      title: t.signup5TabTitle,
      description: t.signup5TabDescription,
      render: () => <MinimalRevealSignup />,
    },
    {
      id: "signup-6",
      title: t.signup6TabTitle,
      description: t.signup6TabDescription,
      render: () => <PasswordStrengthSignup />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.signupTitle}
      intro={m.examples.signupDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="signup"
    />
  );
}
