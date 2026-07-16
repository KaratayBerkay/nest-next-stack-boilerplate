import type { Metadata } from "next";
import { RichItemsExample } from "@/views/ui/accordion/RichItemsExample";

export const metadata: Metadata = {
  title: "Accordion - Rich Items",
  description: "AccordionItemComplex with flexible slots for avatars, badges, and rich content.",
};

export default function RichItemsPage() {
  return (
    <section className="space-y-4">
      <p className="text-muted text-sm italic">
        AccordionItemComplex with flexible slots for avatars, badges, and rich content.
      </p>
      <RichItemsExample />
    </section>
  );
}
