"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { DemoBookingSocialProof } from "./DemoBookingSocialProof";
import { TwoColumnContactLinks } from "./TwoColumnContactLinks";
import { ContactDirectoryOffices } from "./ContactDirectoryOffices";
import { DepartmentCardsCarousel } from "./DepartmentCardsCarousel";
import { CenteredContactForm } from "./CenteredContactForm";
import { ContactChannelsFormHours } from "./ContactChannelsFormHours";
import { ContactMethodGrid } from "./ContactMethodGrid";
import { SplitMediaFramedCards } from "./SplitMediaFramedCards";
import { FormBesideContactMethods } from "./FormBesideContactMethods";
import { GradientHeaderSocialLinks } from "./GradientHeaderSocialLinks";
import { TwoColumnSocialLinks } from "./TwoColumnSocialLinks";
import { AvatarQuickForm } from "./AvatarQuickForm";
import { UnderlineInputsForm } from "./UnderlineInputsForm";
import { LeadFormSocialProof } from "./LeadFormSocialProof";
import { SupportFeaturesCorners } from "./SupportFeaturesCorners";
import { SplitFullHeightImage } from "./SplitFullHeightImage";
import { BorderlessGridForm } from "./BorderlessGridForm";
import { TeamMessageUnderlineForm } from "./TeamMessageUnderlineForm";
import { MultiLocationMap } from "./MultiLocationMap";
import { StoreLocator } from "./StoreLocator";
import { GlobalOfficesGrid } from "./GlobalOfficesGrid";
import { FaqContactForm } from "./FaqContactForm";
import { MultiStepContactForm } from "./MultiStepContactForm";
import { ServiceSelectionContact } from "./ServiceSelectionContact";
import { FullHeightHeroContact } from "./FullHeightHeroContact";
import { SplitCardContact } from "./SplitCardContact";
import { SplitContactFullHeight } from "./SplitContactFullHeight";
import { TwoColumnRoundedPhoto } from "./TwoColumnRoundedPhoto";
import { AsymmetricOverlayDetails } from "./AsymmetricOverlayDetails";
import { CenteredFormBackground } from "./CenteredFormBackground";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ContactPageContent({ initialTab }: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.contact;

  const examples: UIExample[] = [
    {
      id: "contact-1",
      title: t.contact1TabTitle,
      description: t.contact1TabDescription,
      render: () => <DemoBookingSocialProof />,
    },
    {
      id: "contact-2",
      title: t.contact2TabTitle,
      description: t.contact2TabDescription,
      render: () => <TwoColumnContactLinks />,
    },
    {
      id: "contact-3",
      title: t.contact3TabTitle,
      description: t.contact3TabDescription,
      render: () => <ContactDirectoryOffices />,
    },
    {
      id: "contact-4",
      title: t.contact4TabTitle,
      description: t.contact4TabDescription,
      render: () => <DepartmentCardsCarousel />,
    },
    {
      id: "contact-5",
      title: t.contact5TabTitle,
      description: t.contact5TabDescription,
      render: () => <CenteredContactForm />,
    },
    {
      id: "contact-6",
      title: t.contact6TabTitle,
      description: t.contact6TabDescription,
      render: () => <ContactChannelsFormHours />,
    },
    {
      id: "contact-7",
      title: t.contact7TabTitle,
      description: t.contact7TabDescription,
      render: () => <ContactMethodGrid />,
    },
    {
      id: "contact-8",
      title: t.contact8TabTitle,
      description: t.contact8TabDescription,
      render: () => <SplitMediaFramedCards />,
    },
    {
      id: "contact-9",
      title: t.contact9TabTitle,
      description: t.contact9TabDescription,
      render: () => <FormBesideContactMethods />,
    },
    {
      id: "contact-10",
      title: t.contact10TabTitle,
      description: t.contact10TabDescription,
      render: () => <GradientHeaderSocialLinks />,
    },
    {
      id: "contact-11",
      title: t.contact11TabTitle,
      description: t.contact11TabDescription,
      render: () => <TwoColumnSocialLinks />,
    },
    {
      id: "contact-14",
      title: t.contact14TabTitle,
      description: t.contact14TabDescription,
      render: () => <AvatarQuickForm />,
    },
    {
      id: "contact-16",
      title: t.contact16TabTitle,
      description: t.contact16TabDescription,
      render: () => <UnderlineInputsForm />,
    },
    {
      id: "contact-17",
      title: t.contact17TabTitle,
      description: t.contact17TabDescription,
      render: () => <LeadFormSocialProof />,
    },
    {
      id: "contact-18",
      title: t.contact18TabTitle,
      description: t.contact18TabDescription,
      render: () => <SupportFeaturesCorners />,
    },
    {
      id: "contact-19",
      title: t.contact19TabTitle,
      description: t.contact19TabDescription,
      render: () => <SplitFullHeightImage />,
    },
    {
      id: "contact-20",
      title: t.contact20TabTitle,
      description: t.contact20TabDescription,
      render: () => <BorderlessGridForm />,
    },
    {
      id: "contact-21",
      title: t.contact21TabTitle,
      description: t.contact21TabDescription,
      render: () => <TeamMessageUnderlineForm />,
    },
    {
      id: "contact-22",
      title: t.contact22TabTitle,
      description: t.contact22TabDescription,
      render: () => <MultiLocationMap />,
    },
    {
      id: "contact-23",
      title: t.contact23TabTitle,
      description: t.contact23TabDescription,
      render: () => <StoreLocator />,
    },
    {
      id: "contact-24",
      title: t.contact24TabTitle,
      description: t.contact24TabDescription,
      render: () => <GlobalOfficesGrid />,
    },
    {
      id: "contact-25",
      title: t.contact25TabTitle,
      description: t.contact25TabDescription,
      render: () => <FaqContactForm />,
    },
    {
      id: "contact-28",
      title: t.contact28TabTitle,
      description: t.contact28TabDescription,
      render: () => <MultiStepContactForm />,
    },
    {
      id: "contact-29",
      title: t.contact29TabTitle,
      description: t.contact29TabDescription,
      render: () => <ServiceSelectionContact />,
    },
    {
      id: "contact-30",
      title: t.contact30TabTitle,
      description: t.contact30TabDescription,
      render: () => <FullHeightHeroContact />,
    },
    {
      id: "contact-31",
      title: t.contact31TabTitle,
      description: t.contact31TabDescription,
      render: () => <SplitCardContact />,
    },
    {
      id: "contact-32",
      title: t.contact32TabTitle,
      description: t.contact32TabDescription,
      render: () => <SplitContactFullHeight />,
    },
    {
      id: "contact-33",
      title: t.contact33TabTitle,
      description: t.contact33TabDescription,
      render: () => <TwoColumnRoundedPhoto />,
    },
    {
      id: "contact-34",
      title: t.contact34TabTitle,
      description: t.contact34TabDescription,
      render: () => <AsymmetricOverlayDetails />,
    },
    {
      id: "contact-35",
      title: t.contact35TabTitle,
      description: t.contact35TabDescription,
      render: () => <CenteredFormBackground />,
    },
  ];

  return (
    <ExampleTabs
      title={m.examples.contactTitle}
      intro={m.examples.contactDescription}
      examples={examples}
      initialTab={initialTab}
    />
  );
}
