import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useAppForm } from "@/features/forms/form-hook";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { SectionCard } from "./SectionCard";

export function DateTimeSection() {
  const t = useMessages("forms");
  const form = useAppForm({
    defaultValues: { date: "", time: "" },
  });

  return (
    <SectionCard label={t.elements.section_dateTimePickers}>
      <form className="flex flex-col gap-4">
        <form.AppForm>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.AppField name="date">
              {(field) => (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <Label htmlFor={field.name}>
                      {t.elements.dateTimeDate_label}
                    </Label>
                    <FieldInfoButton
                      description={t.elements.dateTimeDate_info}
                    />
                  </div>
                  <Input
                    id={field.name}
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.AppField>
            <form.AppField name="time">
              {(field) => (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <Label htmlFor={field.name}>
                      {t.elements.dateTimeTime_label}
                    </Label>
                    <FieldInfoButton
                      description={t.elements.dateTimeTime_info}
                    />
                  </div>
                  <Input
                    id={field.name}
                    type="time"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.AppField>
          </div>
        </form.AppForm>
      </form>
    </SectionCard>
  );
}
