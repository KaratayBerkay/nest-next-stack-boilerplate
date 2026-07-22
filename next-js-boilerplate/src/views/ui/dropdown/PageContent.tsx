"use client";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { examples } from "./examples";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

export default function DropdownPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Dropdown"
      intro="An options-driven value picker with a fully themed list — trigger and panel share the app theme, unlike a native select."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
