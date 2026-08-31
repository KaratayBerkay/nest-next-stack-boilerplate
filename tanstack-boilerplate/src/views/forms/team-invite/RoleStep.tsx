"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { RoleStepProps } from "@/types/views/forms/RoleStep-types";
import { getRoleOptions } from "./config";

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
            options={getRoleOptions(t as Record<string, string>)}
          />
        )}
      </form.AppField>
    </div>
  );
}
