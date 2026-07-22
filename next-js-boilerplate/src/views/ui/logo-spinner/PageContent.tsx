"use client";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { examples } from "./examples";

export default function LogoSpinnerPage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Logo Spinner"
      intro="A full-page loading spinner with brand logo."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
