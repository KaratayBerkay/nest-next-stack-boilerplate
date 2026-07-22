import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Label } from "@/components/ui/Label";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { SectionCard } from "./SectionCard";

export function TextareaSection() {
  const t = useMessages("forms");

  return (
    <SectionCard label={t.elements.section_textarea}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.textareaDefault_label}</Label>
            <FieldInfoButton description={t.elements.textareaDefault_info} />
          </div>
          <textarea
            className="border-border placeholder:text-muted/70 focus-visible:ring-brand text-fg min-h-20 w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none"
            placeholder={t.elements.textareaDefault_placeholder}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.textareaCharCount_label}</Label>
            <FieldInfoButton description={t.elements.textareaCharCount_info} />
          </div>
          <textarea
            className="border-border placeholder:text-muted/70 focus-visible:ring-brand text-fg min-h-20 w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none"
            placeholder={t.elements.textareaCharCount_placeholder}
            maxLength={100}
            defaultValue=""
          />
          <span className="text-muted ml-auto text-xs tabular-nums">0/100</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.textareaDisabled_label}</Label>
            <FieldInfoButton description={t.elements.textareaDisabled_info} />
          </div>
          <textarea
            className="border-border placeholder:text-muted/70 min-h-20 w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm opacity-50 shadow-sm"
            placeholder={t.elements.textareaDisabled_placeholder}
            disabled
          />
        </div>
      </div>
    </SectionCard>
  );
}
