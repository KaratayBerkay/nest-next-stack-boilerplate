"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { CenteredLogoLinksNavbar } from "./CenteredLogoLinksNavbar";
import { AnnouncementStripNavbar } from "./AnnouncementStripNavbar";
import { ProductMegaMenuNavbar } from "./ProductMegaMenuNavbar";
import { ScrollFadeNavbar } from "./ScrollFadeNavbar";
import { CommandPaletteNavbar } from "./CommandPaletteNavbar";
import { AccountAvatarNavbar } from "./AccountAvatarNavbar";
import { MinimalHamburgerNavbar } from "./MinimalHamburgerNavbar";
import { PricingDropdownNavbar } from "./PricingDropdownNavbar";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function NavbarPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.navbar;

  const examples: UIExample[] = [
    {
      id: "navbar-1",
      title: t.navbar1TabTitle,
      description: t.navbar1TabDescription,
      render: () => <CenteredLogoLinksNavbar />,
    },
    {
      id: "navbar-2",
      title: t.navbar2TabTitle,
      description: t.navbar2TabDescription,
      render: () => <AnnouncementStripNavbar />,
    },
    {
      id: "navbar-3",
      title: t.navbar3TabTitle,
      description: t.navbar3TabDescription,
      render: () => <ProductMegaMenuNavbar />,
    },
    {
      id: "navbar-4",
      title: t.navbar4TabTitle,
      description: t.navbar4TabDescription,
      render: () => <ScrollFadeNavbar />,
    },
    {
      id: "navbar-5",
      title: t.navbar5TabTitle,
      description: t.navbar5TabDescription,
      render: () => <CommandPaletteNavbar />,
    },
    {
      id: "navbar-6",
      title: t.navbar6TabTitle,
      description: t.navbar6TabDescription,
      render: () => <AccountAvatarNavbar />,
    },
    {
      id: "navbar-7",
      title: t.navbar7TabTitle,
      description: t.navbar7TabDescription,
      render: () => <MinimalHamburgerNavbar />,
    },
    {
      id: "navbar-8",
      title: t.navbar8TabTitle,
      description: t.navbar8TabDescription,
      render: () => <PricingDropdownNavbar />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.navbarTitle}
      intro={m.examples.navbarDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="navbar"
    />
  );
}
