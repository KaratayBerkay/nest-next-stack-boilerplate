"use client";

import { useState } from "react";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import { ComponentsTab } from "./ComponentsTab";
import { ExamplesTab } from "./ExamplesTab";
import { InvoiceTableTab } from "./InvoiceTableTab";
import { OnlineFriendsTab } from "./OnlineFriendsTab";
import { LocalizedTab } from "./LocalizedTab";

export default function PaginationPage({
  initialTab,
}: {
  initialTab?: string;
}) {
  const [page, setPage] = useState(1);
  const [invoicePage, setInvoicePage] = useState(1);
  const [friendPage, setFriendPage] = useState(1);

  const examples: UIExample[] = [
    {
      id: "usage",
      title: "Search Results",
      description: "Pagination with ellipsis, sibling, and boundary counts.",
      render: () => <ComponentsTab />,
    },
    {
      id: "variants",
      title: "Compact Touch",
      description: "Mobile prev/next with page indicator.",
      render: () => <ExamplesTab page={page} setPage={setPage} />,
    },
    {
      id: "invoice",
      title: "Invoice Table",
      description: "Paginated invoice table with 25 mock records.",
      render: () => (
        <InvoiceTableTab page={invoicePage} setPage={setInvoicePage} />
      ),
    },
    {
      id: "friends",
      title: "Online Friends",
      description:
        "Infinite-scroll friend list with sentinel-based page detection.",
      render: () => (
        <OnlineFriendsTab page={friendPage} setPage={setFriendPage} />
      ),
    },
    {
      id: "localized",
      title: "Localized",
      description: "Overriding the built-in strings with Turkish copy.",
      render: () => <LocalizedTab />,
    },
  ];

  return (
    <ExampleTabs
      title="Pagination"
      intro="A pagination component."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
