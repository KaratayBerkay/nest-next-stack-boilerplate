"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { StarRatingSheet } from "./StarRatingSheet";
import { MultiStepSurvey } from "./MultiStepSurvey";
import { CompactFeedbackDialog } from "./CompactFeedbackDialog";
import { ExperienceRatingDrawer } from "./ExperienceRatingDrawer";
import { ShoppingRatingSheet } from "./ShoppingRatingSheet";
import { EmojiSatisfactionDialog } from "./EmojiSatisfactionDialog";
import { CategorizedFeedbackDialog } from "./CategorizedFeedbackDialog";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function FeedbackPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.feedback;

  const examples: UIExample[] = [
    {
      id: "feedback-1",
      title: t.feedback1TabTitle,
      description: t.feedback1TabDescription,
      render: () => <StarRatingSheet />,
    },
    {
      id: "feedback-2",
      title: t.feedback2TabTitle,
      description: t.feedback2TabDescription,
      render: () => <MultiStepSurvey />,
    },
    {
      id: "feedback-3",
      title: t.feedback3TabTitle,
      description: t.feedback3TabDescription,
      render: () => <CompactFeedbackDialog />,
    },
    {
      id: "feedback-4",
      title: t.feedback4TabTitle,
      description: t.feedback4TabDescription,
      render: () => <ExperienceRatingDrawer />,
    },
    {
      id: "feedback-5",
      title: t.feedback5TabTitle,
      description: t.feedback5TabDescription,
      render: () => <ShoppingRatingSheet />,
    },
    {
      id: "feedback-6",
      title: t.feedback6TabTitle,
      description: t.feedback6TabDescription,
      render: () => <EmojiSatisfactionDialog />,
    },
    {
      id: "feedback-7",
      title: t.feedback7TabTitle,
      description: t.feedback7TabDescription,
      render: () => <CategorizedFeedbackDialog />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.feedbackTitle}
      intro={m.examples.feedbackDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="feedback"
    />
  );
}
