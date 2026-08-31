"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { WithFormBenefitsLogos } from "./WithFormBenefitsLogos";
import { WithFormAnimatedTestimonials } from "./WithFormAnimatedTestimonials";
import { WithFormTestimonialCards } from "./WithFormTestimonialCards";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function BookADemoPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.bookADemo;

  const examples: UIExample[] = [
    {
      id: "bookademo-1",
      title: t.bookADemo1TabTitle,
      description: t.bookADemo1TabDescription,
      render: () => <WithFormBenefitsLogos />,
    },
    {
      id: "bookademo-2",
      title: t.bookADemo2TabTitle,
      description: t.bookADemo2TabDescription,
      render: () => <WithFormAnimatedTestimonials />,
    },
    {
      id: "bookademo-3",
      title: t.bookADemo3TabTitle,
      description: t.bookADemo3TabDescription,
      render: () => <WithFormTestimonialCards />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.bookADemoTitle}
      intro={m.examples.bookADemoDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="book-a-demo"
    />
  );
}
