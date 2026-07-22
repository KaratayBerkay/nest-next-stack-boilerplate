import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Label } from "@/components/ui/Label";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { SectionCard } from "./SectionCard";

export function SelectsSection() {
  const t = useMessages("forms");

  const SINGLE_OPTIONS = [
    { value: "marketing", label: t.elements.singleSelect_option1 },
    { value: "template", label: t.elements.singleSelect_option2 },
    { value: "development", label: t.elements.singleSelect_option3 },
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
          <div className="flex flex-wrap gap-1">
            {[
              t.elements.multiSelect_option1,
              t.elements.multiSelect_option2,
              t.elements.multiSelect_option3,
            ].map((label) => (
              <span
                key={label}
                className="border-border bg-muted/10 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
              >
                {label}
                <button
                  type="button"
                  className="text-muted hover:text-fg ml-0.5 leading-none"
                >
                  &times;
                </button>
              </span>
            ))}
            <button
              type="button"
              className="border-border text-muted hover:text-fg inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
            >
              {t.elements.multiSelect_chipAdd}
            </button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
