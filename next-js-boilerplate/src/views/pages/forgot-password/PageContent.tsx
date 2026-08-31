"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { CenteredCardForgotPassword } from "./CenteredCardForgotPassword";
import { SplitImageForgotPassword } from "./SplitImageForgotPassword";
import { MinimalInlineForgotPassword } from "./MinimalInlineForgotPassword";
import { MutedPanelForgotPassword } from "./MutedPanelForgotPassword";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ForgotPasswordPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.forgotPassword;

  const examples: UIExample[] = [
    {
      id: "forgot-password-1",
      title: t.forgotPassword1TabTitle,
      description: t.forgotPassword1TabDescription,
      render: () => <CenteredCardForgotPassword />,
    },
    {
      id: "forgot-password-2",
      title: t.forgotPassword2TabTitle,
      description: t.forgotPassword2TabDescription,
      render: () => <SplitImageForgotPassword />,
    },
    {
      id: "forgot-password-3",
      title: t.forgotPassword3TabTitle,
      description: t.forgotPassword3TabDescription,
      render: () => <MinimalInlineForgotPassword />,
    },
    {
      id: "forgot-password-4",
      title: t.forgotPassword4TabTitle,
      description: t.forgotPassword4TabDescription,
      render: () => <MutedPanelForgotPassword />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.forgotPasswordTitle}
      intro={m.examples.forgotPasswordDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="forgot-password"
    />
  );
}
