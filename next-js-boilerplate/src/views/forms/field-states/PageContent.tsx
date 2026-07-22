"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import { FieldStatesGrid } from "./FieldStatesGrid";
import { ValidationModesSection } from "./ValidationModesSection";
import { LinkedFieldsSection } from "./LinkedFieldsSection";
import { ProgrammaticMetaSection } from "./ProgrammaticMetaSection";

export default function FieldStatesPage() {
  const t = useMessages("forms");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.fieldStates.heading}</h2>
      </div>

      <section>
        <h3 className="text-muted mb-3 text-xs font-semibold tracking-wider uppercase">
          Field States
        </h3>
        <FieldStatesGrid />
      </section>

      <section>
        <h3 className="text-muted mb-3 text-xs font-semibold tracking-wider uppercase">
          {t.fieldStates.validationModes}
        </h3>
        <ValidationModesSection />
      </section>

      <section>
        <h3 className="text-muted mb-3 text-xs font-semibold tracking-wider uppercase">
          {t.fieldStates.linkedFields}
        </h3>
        <LinkedFieldsSection />
      </section>

      <section>
        <h3 className="text-muted mb-3 text-xs font-semibold tracking-wider uppercase">
          Programmatic Meta &amp; A11y
        </h3>
        <ProgrammaticMetaSection />
      </section>
    </div>
  );
}
