import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { SectionCard } from "./SectionCard";

export function InputStatesSection() {
  const t = useMessages("forms");

  return (
    <SectionCard label={t.elements.section_inputStates}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.errorState_label}</Label>
            <FieldInfoButton description={t.elements.errorState_info} />
          </div>
          <Input
            placeholder={t.elements.errorState_placeholder}
            className="border-error focus-visible:ring-error"
            error={t.elements.errorState_message}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.successState_label}</Label>
            <FieldInfoButton description={t.elements.successState_info} />
          </div>
          <Input
            placeholder={t.elements.successState_placeholder}
            className="border-success"
            description={t.elements.successState_message}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Disabled</Label>
          <Input placeholder="Cannot edit" disabled />
        </div>
      </div>
    </SectionCard>
  );
}
