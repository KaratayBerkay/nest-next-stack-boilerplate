"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { CenteredProofNewsletter } from "./CenteredProofNewsletter";
import { SplitImageNewsletter } from "./SplitImageNewsletter";
import { MutedBandNewsletter } from "./MutedBandNewsletter";
import { FeatureListCardNewsletter } from "./FeatureListCardNewsletter";
import { InvertedBandNewsletter } from "./InvertedBandNewsletter";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function NewsletterPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.newsletter;

  const examples: UIExample[] = [
    {
      id: "newsletter-1",
      title: t.newsletter1TabTitle,
      description: t.newsletter1TabDescription,
      render: () => <CenteredProofNewsletter />,
    },
    {
      id: "newsletter-2",
      title: t.newsletter2TabTitle,
      description: t.newsletter2TabDescription,
      render: () => <SplitImageNewsletter />,
    },
    {
      id: "newsletter-3",
      title: t.newsletter3TabTitle,
      description: t.newsletter3TabDescription,
      render: () => <MutedBandNewsletter />,
    },
    {
      id: "newsletter-4",
      title: t.newsletter4TabTitle,
      description: t.newsletter4TabDescription,
      render: () => <FeatureListCardNewsletter />,
    },
    {
      id: "newsletter-5",
      title: t.newsletter5TabTitle,
      description: t.newsletter5TabDescription,
      render: () => <InvertedBandNewsletter />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.newsletterTitle}
      intro={m.examples.newsletterDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="newsletter"
    />
  );
}
