import { useState } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Dropdown } from "@/components/ui/Dropdown";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimeInput } from "@/components/ui/TimeInput";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { SectionCard } from "./SectionCard";

export function DefaultInputsSection() {
  const t = useMessages("forms");
  const [demoDate, setDemoDate] = useState<Date | undefined>();
  const [demoTime, setDemoTime] = useState({ hours: 9, minutes: 0 });
  const [demoSelect, setDemoSelect] = useState("");

  const SELECT_OPTIONS = [
    { value: "marketing", label: t.elements.singleSelect_option1 },
    { value: "template", label: t.elements.singleSelect_option2 },
    { value: "development", label: t.elements.singleSelect_option3 },
  ];

  return (
    <SectionCard label={t.elements.section_defaultInputs}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.input_label}</Label>
            <FieldInfoButton description={t.elements.input_info} />
          </div>
          <Input placeholder={t.elements.input_placeholder} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.inputWithPlaceholder_label}</Label>
            <FieldInfoButton
              description={t.elements.inputWithPlaceholder_info}
            />
          </div>
          <Input placeholder={t.elements.inputWithPlaceholder_placeholder} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.selectInput_label}</Label>
            <FieldInfoButton description={t.elements.selectInput_info} />
          </div>
          <Dropdown
            options={SELECT_OPTIONS}
            value={demoSelect}
            onChange={setDemoSelect}
            placeholder={t.elements.singleSelect_placeholder}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.passwordInput_label}</Label>
            <FieldInfoButton description={t.elements.passwordInput_info} />
          </div>
          <Input
            type="password"
            defaultValue="secret123"
            placeholder={t.elements.passwordInput_placeholder}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.datePicker_label}</Label>
            <FieldInfoButton description={t.elements.datePicker_info} />
          </div>
          <DatePicker value={demoDate} onChange={setDemoDate} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.timeSelect_label}</Label>
            <FieldInfoButton description={t.elements.timeSelect_info} />
          </div>
          <TimeInput value={demoTime} onChange={setDemoTime} />
        </div>
      </div>
    </SectionCard>
  );
}
