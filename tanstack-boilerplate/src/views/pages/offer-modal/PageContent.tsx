"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { CornerNewsletterOfferModal } from "./CornerNewsletterOfferModal";
import { MembershipPhotoOfferModal } from "./MembershipPhotoOfferModal";
import { LogoSideSheetOfferModal } from "./LogoSideSheetOfferModal";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function OfferModalPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.offerModal;

  const examples: UIExample[] = [
    {
      id: "offer-modal-1",
      title: t.offerModal1TabTitle,
      description: t.offerModal1TabDescription,
      render: () => <CornerNewsletterOfferModal />,
    },
    {
      id: "offer-modal-4",
      title: t.offerModal4TabTitle,
      description: t.offerModal4TabDescription,
      render: () => <MembershipPhotoOfferModal />,
    },
    {
      id: "offer-modal-5",
      title: t.offerModal5TabTitle,
      description: t.offerModal5TabDescription,
      render: () => <LogoSideSheetOfferModal />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.offerModalTitle}
      intro={m.examples.offerModalDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="offer-modal"
    />
  );
}
