"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { WithCryptoExchange } from "./WithCryptoExchange";
import { WithEmailClient } from "./WithEmailClient";
import { WithFileExplorer } from "./WithFileExplorer";
import { WithFloatingSidebar } from "./WithFloatingSidebar";
import { WithInsetSidebar } from "./WithInsetSidebar";
import { WithMessagingApp } from "./WithMessagingApp";
import { WithModuleSwitcher } from "./WithModuleSwitcher";
import { WithSidebarBreadcrumbs } from "./WithSidebarBreadcrumbs";
import { WithSupportTicket } from "./WithSupportTicket";
import { WithTopNav } from "./WithTopNav";
import { WithTopNavDropdowns } from "./WithTopNavDropdowns";
import { WithTopNavTabs } from "./WithTopNavTabs";
import { WithTwoTierSidebar } from "./WithTwoTierSidebar";
import { WithVideoPlatform } from "./WithVideoPlatform";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ApplicationShellPageContent({
  initialTab,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.applicationShell;

  const examples: UIExample[] = [
    {
      id: "with-sidebar-breadcrumbs",
      title: t.s1TabTitle,
      description: t.s1TabDescription,
      render: () => <WithSidebarBreadcrumbs />,
    },
    {
      id: "with-inset-sidebar",
      title: t.s2TabTitle,
      description: t.s2TabDescription,
      render: () => <WithInsetSidebar />,
    },
    {
      id: "with-top-nav",
      title: t.s3TabTitle,
      description: t.s3TabDescription,
      render: () => <WithTopNav />,
    },
    {
      id: "with-top-nav-tabs",
      title: t.s4TabTitle,
      description: t.s4TabDescription,
      render: () => <WithTopNavTabs />,
    },
    {
      id: "with-floating-sidebar",
      title: t.s5TabTitle,
      description: t.s5TabDescription,
      render: () => <WithFloatingSidebar />,
    },
    {
      id: "with-module-switcher",
      title: t.s6TabTitle,
      description: t.s6TabDescription,
      render: () => <WithModuleSwitcher />,
    },
    {
      id: "with-messaging-app",
      title: t.s7TabTitle,
      description: t.s7TabDescription,
      render: () => <WithMessagingApp />,
    },
    {
      id: "with-email-client",
      title: t.s8TabTitle,
      description: t.s8TabDescription,
      render: () => <WithEmailClient />,
    },
    {
      id: "with-file-explorer",
      title: t.s9TabTitle,
      description: t.s9TabDescription,
      render: () => <WithFileExplorer />,
    },
    {
      id: "with-support-ticket",
      title: t.s10TabTitle,
      description: t.s10TabDescription,
      render: () => <WithSupportTicket />,
    },
    {
      id: "with-video-platform",
      title: t.s11TabTitle,
      description: t.s11TabDescription,
      render: () => <WithVideoPlatform />,
    },
    {
      id: "with-two-tier-sidebar",
      title: t.s12TabTitle,
      description: t.s12TabDescription,
      render: () => <WithTwoTierSidebar />,
    },
    {
      id: "with-top-nav-dropdowns",
      title: t.s13TabTitle,
      description: t.s13TabDescription,
      render: () => <WithTopNavDropdowns />,
    },
    {
      id: "with-crypto-exchange",
      title: t.s14TabTitle,
      description: t.s14TabDescription,
      render: () => <WithCryptoExchange />,
    },
  ];

  return (
    <ExampleTabs
      title={m.examples.applicationShellTitle}
      intro={m.examples.applicationShellDescription}
      examples={examples}
      initialTab={initialTab}
    />
  );
}
