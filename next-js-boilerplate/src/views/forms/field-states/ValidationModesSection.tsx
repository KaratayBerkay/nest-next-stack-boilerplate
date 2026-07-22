"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import { StateCard } from "./StateCard";
import { EagerForm, ClassicForm } from "./EagerClassicForms";
import { DynamicForm, AsyncCheckedForm } from "./DynamicAsyncForms";

export function ValidationModesSection() {
  const t = useMessages("forms");

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted text-xs">
        The same 3-field form mounted with three different validation
        strategies.
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StateCard label={t.fieldStates.eager}>
          <p className="text-xxs text-muted mb-2">
            Validates on every keystroke
          </p>
          <EagerForm />
        </StateCard>
        <StateCard label={t.fieldStates.classic}>
          <p className="text-xxs text-muted mb-2">Validates only on blur</p>
          <ClassicForm />
        </StateCard>
        <StateCard label={t.fieldStates.dynamic}>
          <p className="text-xxs text-muted mb-2">
            Quiet until first blur, then live
          </p>
          <DynamicForm />
        </StateCard>
        <StateCard label={t.fieldStates.asyncChecked}>
          <p className="text-xxs text-muted mb-2">
            Checked against the server on blur
          </p>
          <AsyncCheckedForm />
        </StateCard>
      </div>
    </div>
  );
}
