"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { CenteredCardLogin } from "./CenteredCardLogin";
import { TwoStepEmailPasswordLogin } from "./TwoStepEmailPasswordLogin";
import { MinimalInlineLogin } from "./MinimalInlineLogin";
import { SocialButtonsFirstLogin } from "./SocialButtonsFirstLogin";
import { MutedSplitPanelLogin } from "./MutedSplitPanelLogin";
import { GoogleFirstLogin } from "./GoogleFirstLogin";
import { SplitImageLogin } from "./SplitImageLogin";
import { ProgressiveSocialLogin } from "./ProgressiveSocialLogin";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function LoginPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.login;

  const examples: UIExample[] = [
    {
      id: "login-1",
      title: t.login1TabTitle,
      description: t.login1TabDescription,
      render: () => <CenteredCardLogin />,
    },
    {
      id: "login-2",
      title: t.login2TabTitle,
      description: t.login2TabDescription,
      render: () => <TwoStepEmailPasswordLogin />,
    },
    {
      id: "login-3",
      title: t.login3TabTitle,
      description: t.login3TabDescription,
      render: () => <MinimalInlineLogin />,
    },
    {
      id: "login-4",
      title: t.login4TabTitle,
      description: t.login4TabDescription,
      render: () => <SocialButtonsFirstLogin />,
    },
    {
      id: "login-5",
      title: t.login5TabTitle,
      description: t.login5TabDescription,
      render: () => <MutedSplitPanelLogin />,
    },
    {
      id: "login-6",
      title: t.login6TabTitle,
      description: t.login6TabDescription,
      render: () => <GoogleFirstLogin />,
    },
    {
      id: "login-7",
      title: t.login7TabTitle,
      description: t.login7TabDescription,
      render: () => <SplitImageLogin />,
    },
    {
      id: "login-9",
      title: t.login9TabTitle,
      description: t.login9TabDescription,
      render: () => <ProgressiveSocialLogin />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.loginTitle}
      intro={m.examples.loginDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="login"
    />
  );
}
