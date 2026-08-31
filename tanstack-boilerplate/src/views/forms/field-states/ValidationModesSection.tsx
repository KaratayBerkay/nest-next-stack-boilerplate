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
        {t.fieldStates.validationModesDescription}
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StateCard label={t.fieldStates.eager}>
          <p className="text-xxs text-muted mb-2">
            {t.fieldStates.eagerDescription}
          </p>
          <EagerForm />
        </StateCard>
        <StateCard label={t.fieldStates.classic}>
          <p className="text-xxs text-muted mb-2">
            {t.fieldStates.classicDescription}
          </p>
          <ClassicForm />
        </StateCard>
        <StateCard label={t.fieldStates.dynamic}>
          <p className="text-xxs text-muted mb-2">
            {t.fieldStates.dynamicDescription}
          </p>
          <DynamicForm />
        </StateCard>
        <StateCard label={t.fieldStates.asyncChecked}>
          <p className="text-xxs text-muted mb-2">
            {t.fieldStates.asyncCheckedDescription}
          </p>
          <AsyncCheckedForm />
        </StateCard>
      </div>
    </div>
  );
}
