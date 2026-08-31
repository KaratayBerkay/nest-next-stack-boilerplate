"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { CenteredCardResetPassword } from "./CenteredCardResetPassword";
import { SplitImageResetPassword } from "./SplitImageResetPassword";
import { MinimalStackResetPassword } from "./MinimalStackResetPassword";
import { RequirementsChecklistResetPassword } from "./RequirementsChecklistResetPassword";
import { RequirementsPanelResetPassword } from "./RequirementsPanelResetPassword";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ResetPasswordPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.resetPassword;

  const examples: UIExample[] = [
    {
      id: "reset-password-1",
      title: t.resetPassword1TabTitle,
      description: t.resetPassword1TabDescription,
      render: () => <CenteredCardResetPassword />,
    },
    {
      id: "reset-password-2",
      title: t.resetPassword2TabTitle,
      description: t.resetPassword2TabDescription,
      render: () => <SplitImageResetPassword />,
    },
    {
      id: "reset-password-3",
      title: t.resetPassword3TabTitle,
      description: t.resetPassword3TabDescription,
      render: () => <MinimalStackResetPassword />,
    },
    {
      id: "reset-password-4",
      title: t.resetPassword4TabTitle,
      description: t.resetPassword4TabDescription,
      render: () => <RequirementsChecklistResetPassword />,
    },
    {
      id: "reset-password-6",
      title: t.resetPassword6TabTitle,
      description: t.resetPassword6TabDescription,
      render: () => <RequirementsPanelResetPassword />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.resetPasswordTitle}
      intro={m.examples.resetPasswordDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="reset-password"
    />
  );
}
