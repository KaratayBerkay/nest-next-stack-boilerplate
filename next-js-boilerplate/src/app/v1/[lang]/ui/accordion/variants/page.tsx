import type { Metadata } from "next";
import { MultiStateExample } from "@/views/ui/accordion/MultiStateExample";

export const metadata: Metadata = {
  title: "Accordion - Multi State",
  description: "When a new accordion opens, the other open ones don't close.",
};

export default function VariantsPage() {
  return (
    <section className="space-y-4">
      <p className="text-muted text-sm italic">
        When a new accordion opens, the other open ones don&apos;t close.
      </p>
      <MultiStateExample />
    </section>
  );
}
