import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useAppForm } from "@/features/forms/form-hook";
import { Label } from "@/components/ui/Label";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimeInput } from "@/components/ui/TimeInput";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { convertTextToDate, formatDateOnly } from "@/lib/date-time";
import { SectionCard } from "./SectionCard";

function parseTimeValue(value: string): { hours: number; minutes: number } {
  const [hours, minutes] = value.split(":").map(Number);
  return { hours: hours || 0, minutes: minutes || 0 };
}

function formatTimeValue(time: { hours: number; minutes: number }): string {
  return `${String(time.hours).padStart(2, "0")}:${String(time.minutes).padStart(2, "0")}`;
}

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
                  <DatePicker
                    value={
                      field.state.value
                        ? (convertTextToDate(field.state.value) as Date)
                        : undefined
                    }
                    onChange={(date) =>
                      field.handleChange(date ? formatDateOnly(date) : "")
                    }
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
                  <TimeInput
                    value={
                      field.state.value
                        ? parseTimeValue(field.state.value)
                        : { hours: 0, minutes: 0 }
                    }
                    onChange={(time) =>
                      field.handleChange(formatTimeValue(time))
                    }
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
