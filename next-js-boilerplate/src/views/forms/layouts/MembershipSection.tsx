import { useMessages } from "@/lib/i18n/MessagesProvider";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import type { MembershipSectionProps } from "@/types/views/forms/MembershipSection-types";

export function MembershipSection({ form }: MembershipSectionProps) {
  const t = useMessages("forms");

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xxs text-muted border-brand border-l-2 pl-3 tracking-wider uppercase">
        {t.layouts.sectioned_membership}
      </p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          <Label>{t.layouts.sectionedPlan_label}</Label>
          <FieldInfoButton description={t.layouts.sectionedPlan_info} />
        </div>
        <RadioGroup
          value={form.getFieldValue("plan")}
          onValueChange={(v) => form.setFieldValue("plan", v)}
        >
          <div className="flex gap-4">
            {[
              { value: "free" as const, label: t.layouts.sectionedPlan_free },
              { value: "basic" as const, label: t.layouts.sectionedPlan_basic },
              {
                value: "premium" as const,
                label: t.layouts.sectionedPlan_premium,
              },
            ].map((p) => (
              <label key={p.value} className="flex items-center gap-2 text-sm">
                <RadioGroupItem value={p.value} />
                {p.label}
              </label>
            ))}
          </div>
        </RadioGroup>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Switch
          checked={form.getFieldValue("agree")}
          onChange={() =>
            form.setFieldValue("agree", !form.getFieldValue("agree"))
          }
        />
        <div className="flex items-center gap-1">
          <Label>{t.layouts.sectionedAgree_label}</Label>
          <FieldInfoButton description={t.layouts.sectionedAgree_info} />
        </div>
      </div>
    </div>
  );
}
