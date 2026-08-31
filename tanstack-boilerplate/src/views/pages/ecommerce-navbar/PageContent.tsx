"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { MegaMenuEcommerceNavbar } from "./MegaMenuEcommerceNavbar";
import { LayeredDropdownEcommerceNavbar } from "./LayeredDropdownEcommerceNavbar";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function EcommerceNavbarPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.ecommerceNavbar;

  const examples: UIExample[] = [
    {
      id: "ecommerce-navbar-1",
      title: t.ecommerceNavbar1TabTitle,
      description: t.ecommerceNavbar1TabDescription,
      render: () => <MegaMenuEcommerceNavbar />,
    },
    {
      id: "ecommerce-navbar-2",
      title: t.ecommerceNavbar2TabTitle,
      description: t.ecommerceNavbar2TabDescription,
      render: () => <LayeredDropdownEcommerceNavbar />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.ecommerceNavbarTitle}
      intro={m.examples.ecommerceNavbarDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="ecommerce-navbar"
    />
  );
}
