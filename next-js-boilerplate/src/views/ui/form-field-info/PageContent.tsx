"use client";

import { FormFieldInfo } from "@/components/ui/FormFieldInfo";

export default function FormFieldInfoPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">Form Field Info</h2>
        <p className="text-muted text-xs">Error text and validating spinner for form fields</p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="surface flex flex-col gap-2 rounded-lg border border-border p-4">
          <p className="text-xs font-medium">Error state</p>
          <FormFieldInfo field={{ state: { meta: { errors: ["This field is required"] } } }} />
        </div>
        <div className="surface flex flex-col gap-2 rounded-lg border border-border p-4">
          <p className="text-xs font-medium">Validating state</p>
          <FormFieldInfo field={{ state: { meta: { errors: [], isValidating: true } } }} />
        </div>
        <div className="surface flex flex-col gap-2 rounded-lg border border-border p-4">
          <p className="text-xs font-medium">Idle state (no output)</p>
          <FormFieldInfo field={{ state: { meta: { errors: [] } } }} />
        </div>
      </div>
    </div>
  );
}
