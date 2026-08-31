"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { ContactPhotoListAddressBook } from "./ContactPhotoListAddressBook";
import { AddressCardGridAddressBook } from "./AddressCardGridAddressBook";
import { CheckoutAddressSheetAddressBook } from "./CheckoutAddressSheetAddressBook";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function AddressBookPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.addressBook;

  const examples: UIExample[] = [
    {
      id: "address-book-1",
      title: t.addressBook1TabTitle,
      description: t.addressBook1TabDescription,
      render: () => <ContactPhotoListAddressBook />,
    },
    {
      id: "address-book-2",
      title: t.addressBook2TabTitle,
      description: t.addressBook2TabDescription,
      render: () => <AddressCardGridAddressBook />,
    },
    {
      id: "address-book-4",
      title: t.addressBook4TabTitle,
      description: t.addressBook4TabDescription,
      render: () => <CheckoutAddressSheetAddressBook />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.addressBookTitle}
      intro={m.examples.addressBookDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="address-book"
    />
  );
}
