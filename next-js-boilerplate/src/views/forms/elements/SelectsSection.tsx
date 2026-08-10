import { useState } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Label } from "@/components/ui/Label";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Combobox } from "@/components/ui/Combobox";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { SectionCard } from "./SectionCard";

export function SelectsSection() {
  const t = useMessages("forms");
  const [multiValue, setMultiValue] = useState<string[]>([]);

  const SINGLE_OPTIONS = [
    { value: "marketing", label: t.elements.singleSelect_option1 },
    { value: "template", label: t.elements.singleSelect_option2 },
    { value: "development", label: t.elements.singleSelect_option3 },
  ];

  const MULTI_OPTIONS = [
    { value: "option1", label: t.elements.multiSelect_option1 },
    { value: "option2", label: t.elements.multiSelect_option2 },
    { value: "option3", label: t.elements.multiSelect_option3 },
  ];

  return (
    <SectionCard label={t.elements.section_selectInputs}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.singleSelect_label}</Label>
            <FieldInfoButton description={t.elements.singleSelect_info} />
          </div>
          <NativeSelect>
            <option value="">{t.elements.singleSelect_placeholder}</option>
            {SINGLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.multiSelect_label}</Label>
            <FieldInfoButton description={t.elements.multiSelect_info} />
          </div>
          <Combobox
            options={MULTI_OPTIONS}
            multiple
            value={multiValue}
            onValueChange={(v) => setMultiValue(v as string[])}
            placeholder={t.elements.multiSelect_chipAdd}
          />
        </div>
      </div>
    </SectionCard>
  );
}
