/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";

interface MembershipSectionProps {
  form: any;
}

export function MembershipSection({ form }: MembershipSectionProps) {
  const t = useMessages("forms");

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xxs text-muted border-brand border-l-2 pl-3 tracking-wider uppercase">
        Membership
      </p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          <Label>{t.layouts.sectionedPlan_label}</Label>
          <FieldInfoButton description={t.layouts.sectionedPlan_info} />
        </div>
        <div className="flex gap-4">
          {[
            { value: "free" as const, label: "Free" },
            { value: "basic" as const, label: "Basic" },
            { value: "premium" as const, label: "Premium" },
          ].map((p) => (
            <label
              key={p.value}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="radio"
                name="plan"
                value={p.value}
                className="accent-brand"
                checked={form.getFieldValue("plan") === p.value}
                onChange={() => form.setFieldValue("plan", p.value)}
              />
              {p.label}
            </label>
          ))}
        </div>
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
