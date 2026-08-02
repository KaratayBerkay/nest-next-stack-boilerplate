"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { RoleStepProps } from "@/types/views/forms/RoleStep-types";

const ROLE_OPTIONS = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
  { value: "owner", label: "Owner" },
];

export function RoleStep({ form, t, roleSchema }: RoleStepProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium">{t.stepRole as string}</p>
      <form.AppField
        name="role"
        validators={{ onChange: roleSchema.shape.role }}
      >
        {(field: any) => (
          <field.RadioGroupField
            label={t.roleLabel as string}
            options={ROLE_OPTIONS}
          />
        )}
      </form.AppField>
    </div>
  );
}
