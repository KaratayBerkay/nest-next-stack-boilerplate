import type { Metadata } from "next";
import { SingleStateExample } from "@/views/ui/accordion/SingleStateExample";

export const metadata: Metadata = {
  title: "Accordion - Single State",
  description: "When a new accordion opens, the other open one closes.",
};

export default function UsagePage() {
  return (
    <section className="space-y-4">
      <p className="text-muted text-sm italic">
        When a new accordion opens, the other open one closes.
      </p>
      <SingleStateExample />
    </section>
  );
}
