"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { NarrativeDetailCards } from "./NarrativeDetailCards";
import { FeatureGridExpertLink } from "./FeatureGridExpertLink";
import { SecurityPracticesBadges } from "./SecurityPracticesBadges";
import { SplitSecurityOverview } from "./SplitSecurityOverview";
import { CenteredBadgeGrid } from "./CenteredBadgeGrid";
import { HeroCertificationLattice } from "./HeroCertificationLattice";
import { CloudFeaturesBadges } from "./CloudFeaturesBadges";
import { CertificationLogosDocs } from "./CertificationLogosDocs";
import { TrustMetricsStatusCards } from "./TrustMetricsStatusCards";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function CompliancePageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.compliance;

  const examples: UIExample[] = [
    {
      id: "compliance-1",
      title: t.compliance1TabTitle,
      description: t.compliance1TabDescription,
      render: () => <NarrativeDetailCards />,
    },
    {
      id: "compliance-2",
      title: t.compliance2TabTitle,
      description: t.compliance2TabDescription,
      render: () => <FeatureGridExpertLink />,
    },
    {
      id: "compliance-3",
      title: t.compliance3TabTitle,
      description: t.compliance3TabDescription,
      render: () => <SecurityPracticesBadges />,
    },
    {
      id: "compliance-4",
      title: t.compliance4TabTitle,
      description: t.compliance4TabDescription,
      render: () => <SplitSecurityOverview />,
    },
    {
      id: "compliance-5",
      title: t.compliance5TabTitle,
      description: t.compliance5TabDescription,
      render: () => <CenteredBadgeGrid />,
    },
    {
      id: "compliance-6",
      title: t.compliance6TabTitle,
      description: t.compliance6TabDescription,
      render: () => <HeroCertificationLattice />,
    },
    {
      id: "compliance-7",
      title: t.compliance7TabTitle,
      description: t.compliance7TabDescription,
      render: () => <CloudFeaturesBadges />,
    },
    {
      id: "compliance-8",
      title: t.compliance8TabTitle,
      description: t.compliance8TabDescription,
      render: () => <CertificationLogosDocs />,
    },
    {
      id: "compliance-9",
      title: t.compliance9TabTitle,
      description: t.compliance9TabDescription,
      render: () => <TrustMetricsStatusCards />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.complianceTitle}
      intro={m.examples.complianceDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="compliance"
    />
  );
}
