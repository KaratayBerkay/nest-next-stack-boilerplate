"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { CenteredAccordionFaq } from "./CenteredAccordionFaq";
import { BorderedRowsFaq } from "./BorderedRowsFaq";
import { CenteredIntroAccordionFaq } from "./CenteredIntroAccordionFaq";
import { BadgeAccordionFaq } from "./BadgeAccordionFaq";
import { NumberedListFaq } from "./NumberedListFaq";
import { NumberedGridFaq } from "./NumberedGridFaq";
import { SplitAccordionCtaFaq } from "./SplitAccordionCtaFaq";
import { CategorizedTwoBandFaq } from "./CategorizedTwoBandFaq";
import { CardAccordionFaq } from "./CardAccordionFaq";
import { BorderedBandFaq } from "./BorderedBandFaq";
import { SplitIntroCategoriesFaq } from "./SplitIntroCategoriesFaq";
import { SidebarScrollSyncFaq } from "./SidebarScrollSyncFaq";
import { CenteredCategoryCardsFaq } from "./CenteredCategoryCardsFaq";
import { TwoColumnIconGridFaq } from "./TwoColumnIconGridFaq";
import { NarrowAccordionFaq } from "./NarrowAccordionFaq";
import { ProfileContactFaq } from "./ProfileContactFaq";
import { TabbedCategoriesFaq } from "./TabbedCategoriesFaq";
import { CategoryListAccordionFaq } from "./CategoryListAccordionFaq";
import { TwoColumnCategorizedFaq } from "./TwoColumnCategorizedFaq";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function FaqPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.faq;

  const examples: UIExample[] = [
    {
      id: "faq-1",
      title: t.faq1TabTitle,
      description: t.faq1TabDescription,
      render: () => <CenteredAccordionFaq />,
    },
    {
      id: "faq-2",
      title: t.faq2TabTitle,
      description: t.faq2TabDescription,
      render: () => <BorderedRowsFaq />,
    },
    {
      id: "faq-3",
      title: t.faq3TabTitle,
      description: t.faq3TabDescription,
      render: () => <CenteredIntroAccordionFaq />,
    },
    {
      id: "faq-4",
      title: t.faq4TabTitle,
      description: t.faq4TabDescription,
      render: () => <BadgeAccordionFaq />,
    },
    {
      id: "faq-5",
      title: t.faq5TabTitle,
      description: t.faq5TabDescription,
      render: () => <NumberedListFaq />,
    },
    {
      id: "faq-6",
      title: t.faq6TabTitle,
      description: t.faq6TabDescription,
      render: () => <NumberedGridFaq />,
    },
    {
      id: "faq-7",
      title: t.faq7TabTitle,
      description: t.faq7TabDescription,
      render: () => <SplitAccordionCtaFaq />,
    },
    {
      id: "faq-8",
      title: t.faq8TabTitle,
      description: t.faq8TabDescription,
      render: () => <CategorizedTwoBandFaq />,
    },
    {
      id: "faq-9",
      title: t.faq9TabTitle,
      description: t.faq9TabDescription,
      render: () => <CardAccordionFaq />,
    },
    {
      id: "faq-10",
      title: t.faq10TabTitle,
      description: t.faq10TabDescription,
      render: () => <BorderedBandFaq />,
    },
    {
      id: "faq-11",
      title: t.faq11TabTitle,
      description: t.faq11TabDescription,
      render: () => <SplitIntroCategoriesFaq />,
    },
    {
      id: "faq-12",
      title: t.faq12TabTitle,
      description: t.faq12TabDescription,
      render: () => <SidebarScrollSyncFaq />,
    },
    {
      id: "faq-14",
      title: t.faq14TabTitle,
      description: t.faq14TabDescription,
      render: () => <CenteredCategoryCardsFaq />,
    },
    {
      id: "faq-15",
      title: t.faq15TabTitle,
      description: t.faq15TabDescription,
      render: () => <TwoColumnIconGridFaq />,
    },
    {
      id: "faq-16",
      title: t.faq16TabTitle,
      description: t.faq16TabDescription,
      render: () => <NarrowAccordionFaq />,
    },
    {
      id: "faq-17",
      title: t.faq17TabTitle,
      description: t.faq17TabDescription,
      render: () => <ProfileContactFaq />,
    },
    {
      id: "faq-18",
      title: t.faq18TabTitle,
      description: t.faq18TabDescription,
      render: () => <TabbedCategoriesFaq />,
    },
    {
      id: "faq-19",
      title: t.faq19TabTitle,
      description: t.faq19TabDescription,
      render: () => <CategoryListAccordionFaq />,
    },
    {
      id: "faq-20",
      title: t.faq20TabTitle,
      description: t.faq20TabDescription,
      render: () => <TwoColumnCategorizedFaq />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.faqTitle}
      intro={m.examples.faqDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="faq"
    />
  );
}
