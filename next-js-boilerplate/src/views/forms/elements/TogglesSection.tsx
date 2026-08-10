import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Checkbox } from "@/components/ui/Checkbox";
import { Switch } from "@/components/ui/Switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { SectionCard } from "./SectionCard";

export function CheckboxSection() {
  const t = useMessages("forms");

  return (
    <SectionCard label={t.elements.section_checkboxes}>
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2 text-sm">
          <Checkbox id="chk-default" />
          <label htmlFor="chk-default">
            {t.elements.checkboxDefault_label}
          </label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Checkbox id="chk-checked" defaultChecked />
          <label htmlFor="chk-checked">
            {t.elements.checkboxChecked_label}
          </label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Checkbox id="chk-disabled" disabled />
          <label htmlFor="chk-disabled">
            {t.elements.checkboxDisabled_label}
          </label>
        </div>
      </div>
    </SectionCard>
  );
}

export function RadioSection() {
  const t = useMessages("forms");

  return (
    <SectionCard label={t.elements.section_radioButtons}>
      <div className="flex flex-wrap gap-6">
        <RadioGroup defaultValue="selected">
          <div className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="default" id="radio-default" />
            <label htmlFor="radio-default">
              {t.elements.radioDefault_label}
            </label>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="selected" id="radio-selected" />
            <label htmlFor="radio-selected">
              {t.elements.radioSelected_label}
            </label>
          </div>
        </RadioGroup>
        <RadioGroup>
          <div className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="disabled" id="radio-disabled" disabled />
            <label htmlFor="radio-disabled">
              {t.elements.radioDisabled_label}
            </label>
          </div>
        </RadioGroup>
      </div>
    </SectionCard>
  );
}

export function ToggleSection() {
  const t = useMessages("forms");

  return (
    <SectionCard label={t.elements.section_toggleSwitches}>
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2 text-sm">
          <Switch id="toggle-default" />
          <label htmlFor="toggle-default">
            {t.elements.toggleDefault_label}
          </label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Switch id="toggle-checked" defaultChecked />
          <label htmlFor="toggle-checked">
            {t.elements.toggleChecked_label}
          </label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Switch id="toggle-disabled" disabled />
          <label htmlFor="toggle-disabled">
            {t.elements.toggleDisabled_label}
          </label>
        </div>
      </div>
    </SectionCard>
  );
}
