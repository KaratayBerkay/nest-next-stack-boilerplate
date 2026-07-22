"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import { DefaultInputsSection } from "./DefaultInputsSection";
import { InputGroupsSection } from "./InputGroupsSection";
import { SelectsSection } from "./SelectsSection";
import { TextareaSection } from "./TextareaSection";
import { InputStatesSection } from "./InputStatesSection";
import { FileInputSection, DropzoneSection } from "./FileUploadSections";
import { CheckboxSection, RadioSection, ToggleSection } from "./TogglesSection";
import { DateTimeSection } from "./DateTimeSection";
import { FormValidationSection } from "./FormValidationSection";

export default function FormElementsPage() {
  const t = useMessages("forms");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.elements.heading}</h2>
        <p className="text-muted text-xs">{t.elements.description}</p>
      </div>
      <DefaultInputsSection />
      <InputGroupsSection />
      <SelectsSection />
      <TextareaSection />
      <InputStatesSection />
      <FileInputSection />
      <DropzoneSection />
      <DateTimeSection />
      <CheckboxSection />
      <RadioSection />
      <ToggleSection />
      <FormValidationSection />
    </div>
  );
}
