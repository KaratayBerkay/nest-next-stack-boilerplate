import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Checkbox } from "@/components/ui/Checkbox";
import { Switch } from "@/components/ui/Switch";
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
          <Checkbox id="chk-checked" checked />
          <label htmlFor="chk-checked">
            {t.elements.checkboxChecked_label}
          </label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Checkbox id="chk-disabled" disabled />
          <label htmlFor="chk-disabled">Disabled</label>
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
        <div className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="radio-demo"
            id="radio-default"
            className="accent-brand"
          />
          <label htmlFor="radio-default">Default</label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="radio-demo"
            id="radio-selected"
            defaultChecked
            className="accent-brand"
          />
          <label htmlFor="radio-selected">
            {t.elements.radioSelected_label}
          </label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="radio-demo-disabled"
            id="radio-disabled"
            disabled
            className="accent-brand"
          />
          <label htmlFor="radio-disabled">
            {t.elements.radioDisabled_label}
          </label>
        </div>
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
          <label htmlFor="toggle-disabled">Disabled</label>
        </div>
      </div>
    </SectionCard>
  );
}
