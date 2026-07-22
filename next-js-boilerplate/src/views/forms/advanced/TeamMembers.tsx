/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { Button } from "@/components/ui/Button";
import type { AdvancedFormType } from "@/types/forms/AdvancedPage-types";

const EMPTY_MEMBER = { name: "", email: "", role: "" };

const ROLE_OPTIONS = (t: Record<string, string>) => [
  { value: "developer", label: t.roleDeveloper },
  { value: "designer", label: t.roleDesigner },
  { value: "manager", label: t.roleManager },
  { value: "viewer", label: t.roleViewer },
];

interface TeamMembersProps {
  form: AdvancedFormType;
  fieldSchemas: Record<string, unknown>;
  members: Array<{ name: string; email: string; role: string }>;
  t: Record<string, string>;
}

export function TeamMembers({ form, fieldSchemas, members, t }: TeamMembersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1">
        <p className="text-xs font-semibold">{t.teamMembers}</p>
        <FieldInfoButton description={t.teamMembersInfo} />
      </div>

      {members.map((_, i) => (
        <div
          key={i}
          className="animate-fade-in border-border surface flex flex-col gap-3 rounded-lg border p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xxs text-muted">
              {t.memberName} {i + 1}
            </span>
            <button
              type="button"
              className="text-destructive text-xxs hover:underline"
              onClick={() => form.removeFieldValue("members", i)}
            >
              {t.removeMember}
            </button>
          </div>

          <form.AppField
            name={`members[${i}].name`}
            validators={{ onChange: fieldSchemas.memberName }}
          >
            {(field: any) => (
              <div className="flex items-center gap-1">
                <field.TextField
                  label={t.memberName}
                  placeholder={t.memberNamePlaceholder}
                  required
                />
                <FieldInfoButton description={t.memberNameInfo} />
              </div>
            )}
          </form.AppField>

          <form.AppField
            name={`members[${i}].email`}
            validators={{ onChange: fieldSchemas.memberEmail }}
          >
            {(field: any) => (
              <div className="flex items-center gap-1">
                <field.TextField
                  label={t.memberEmail}
                  placeholder={t.memberEmailPlaceholder}
                  required
                />
                <FieldInfoButton description={t.memberEmailInfo} />
              </div>
            )}
          </form.AppField>

          <form.AppField
            name={`members[${i}].role`}
            validators={{ onChange: fieldSchemas.memberRole }}
          >
            {(field: any) => (
              <field.SelectField
                label={t.memberRole}
                placeholder={t.memberRole}
                options={ROLE_OPTIONS(t)}
              />
            )}
          </form.AppField>
        </div>
      ))}

      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => form.pushFieldValue("members", { ...EMPTY_MEMBER })}
        >
          {t.addMember}
        </Button>
      </div>
    </div>
  );
}
