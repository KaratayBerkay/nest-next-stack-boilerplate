"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import { ContactForm } from "./ContactForm";
import { TwoColumnGridForm } from "./TwoColumnGridForm";
import { IconPrefixedForm } from "./IconPrefixedForm";
import { SectionedCardForm } from "./SectionedCardForm";

export default function FormLayoutsPage() {
  const t = useMessages("forms");
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.layouts.heading}</h2>
        <p className="text-muted text-xs">{t.layouts.description}</p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ContactForm />
        <TwoColumnGridForm />
        <IconPrefixedForm />
      </div>
      <SectionedCardForm />
    </div>
  );
}
