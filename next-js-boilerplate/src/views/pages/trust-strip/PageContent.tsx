"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { GuaranteeIconGridTrustStrip } from "./GuaranteeIconGridTrustStrip";
import { PressRatingStripTrustStrip } from "./PressRatingStripTrustStrip";
import { CertificationPillsTrustStrip } from "./CertificationPillsTrustStrip";
import { SellerRatingBadgeTrustStrip } from "./SellerRatingBadgeTrustStrip";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function TrustStripPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.trustStrip;

  const examples: UIExample[] = [
    {
      id: "trust-strip-1",
      title: t.trustStrip1TabTitle,
      description: t.trustStrip1TabDescription,
      render: () => <GuaranteeIconGridTrustStrip />,
    },
    {
      id: "trust-strip-2",
      title: t.trustStrip2TabTitle,
      description: t.trustStrip2TabDescription,
      render: () => <PressRatingStripTrustStrip />,
    },
    {
      id: "trust-strip-3",
      title: t.trustStrip3TabTitle,
      description: t.trustStrip3TabDescription,
      render: () => <CertificationPillsTrustStrip />,
    },
    {
      id: "trust-strip-4",
      title: t.trustStrip4TabTitle,
      description: t.trustStrip4TabDescription,
      render: () => <SellerRatingBadgeTrustStrip />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.trustStripTitle}
      intro={m.examples.trustStripDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="trust-strip"
    />
  );
}
