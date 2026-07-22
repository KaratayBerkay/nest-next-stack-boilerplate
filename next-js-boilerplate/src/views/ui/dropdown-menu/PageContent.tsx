"use client";
import { AccountMenuTab } from "./AccountMenuTab";
import { DestructiveItemTab } from "./DestructiveItemTab";
import { WithIconsTab } from "./WithIconsTab";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

const examples: UIExample[] = [
  {
    id: "account-menu",
    title: "Account Menu",
    description:
      "A standard dropdown menu with account actions and keyboard shortcuts.",
    render: () => <AccountMenuTab />,
  },
  {
    id: "destructive",
    title: "Destructive Item",
    description:
      "A destructive action using text-error styling. Consumer onClick still closes the menu (dogfoods C5 fix).",
    render: () => <DestructiveItemTab />,
  },
  {
    id: "with-icons",
    title: "With Icons",
    description: "Menu items with leading SVG icons for visual scanning.",
    render: () => <WithIconsTab />,
  },
];

export default function Page({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Dropdown Menu"
      intro="A contextual menu that appears on trigger click. Items close the menu on selection."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
