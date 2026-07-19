# New Form Domain Recipe

## File Layout

```
src/validators/forms/<domain>.ts         — Zod schemas + factory function
src/validators/forms/<domain>-inits.ts   — Typed defaultValues
src/views/forms/<domain>/PageContent.tsx — Form view
```

## Step-by-step

### 1. Schema file: `src/validators/forms/<domain>.ts`

```ts
import { z } from "zod";

const DEFAULT_T: Record<string, string> = {
  nameRequired: "Name is required",
};

export const domainSchema = createDomainSchema(DEFAULT_T);

export function createDomainSchema(t: Record<string, string>) {
  return z.object({
    name: z.string().min(1, t.nameRequired ?? "Name is required"),
  });
}
```

### 2. Inits file: `src/validators/forms/<domain>-inits.ts`

```ts
import { z } from "zod";
import { domainSchema } from "./<domain>";

export const domainDefaultValues = {
  name: "",
} satisfies z.input<typeof domainSchema>;
```

### 3. Form view: `src/views/forms/<domain>/PageContent.tsx`

```tsx
"use client";

import { useMemo } from "react";
import { useMessages, useAllMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { formOptions } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import { FormErrorBanner } from "@/components/ui/FormErrorBanner";
import { getSurface, exceptionHandler } from "@/lib/exception-handler";
import { exceptionToFormErrors } from "@/lib/forms/exception-to-form-errors";
import type { ExceptionResponse } from "@/lib/api-client";
import { createDomainSchema, domainSchema } from "@/validators/forms/<domain>";
import { domainDefaultValues } from "@/validators/forms/<domain>-inits";
import { useFormsDemoActions } from "@/api/client/forms-demo/actions";

const domainFormOpts = formOptions({
  defaultValues: domainDefaultValues,
});

async function submitDomain(
  { value }: { value: typeof domainFormOpts.defaultValues },
  deps: {
    simulateError: (id: string, opts?: { failRate?: number }) => Promise<ExceptionResponse>;
    toast: ReturnType<typeof useToast>["toast"];
    allMessages: Record<string, unknown>;
  },
) {
  try {
    await deps.simulateError("some-error", { failRate: 0 });
    deps.toast({ description: "Success", variant: "default" });
    return null;
  } catch (err) {
    const exc = (err as { exception?: ExceptionResponse }).exception;
    if (!exc) return { form: "An unexpected error occurred", fields: {} };
    if (getSurface(exc.exc) === "toast") {
      deps.toast({ description: exceptionHandler(exc, deps.allMessages), variant: "destructive" });
      return null;
    }
    return exceptionToFormErrors(exc, deps.allMessages);
  }
}

export default function DomainPage() {
  const t = useMessages("forms");
  const allMessages = useAllMessages();
  const { toast } = useToast();
  const { simulateError } = useFormsDemoActions();
  const fieldSchemas = useMemo(() => createDomainSchema(t.domain ?? {}), [t]);

  const form = useAppForm({
    ...domainFormOpts,
    validators: {
      onChange: domainSchema,
      onSubmitAsync: ({ value }) =>
        submitDomain({ value }, { simulateError, toast, allMessages }),
    },
    onSubmit: async () => {},
  });

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-sm font-semibold">Domain</h2>
      <form className="flex flex-col gap-4">
        <form.Subscribe selector={(s) => s.errorMap.onSubmit}>
          {(error) => error ? (
            <FormErrorBanner
              message={String(error)}
              onDismiss={() => form.setErrorMap({ onSubmit: undefined as never })}
            />
          ) : null}
        </form.Subscribe>
        <form.AppField name="name" validators={{ onChange: fieldSchemas.shape.name }}>
          {(field) => <field.TextField label="Name" />}
        </form.AppField>
        <form.AppForm>
          <form.SubmitButton label="Submit" loadingLabel="Submitting..." />
        </form.AppForm>
      </form>
    </div>
  );
}
```

## Conventions Checklist

- [ ] Module-level `formOptions({ defaultValues })` 
- [ ] `defaultValues` imported from `*-inits.ts`
- [ ] Module-level extracted submit handler (no inline closures)
- [ ] `validators.onSubmitAsync` returns `{ form, fields } | null`
- [ ] `onSubmit` for success-only side effects (toast, reset, nav)
- [ ] `form.Subscribe(selector: s => s.errorMap.onSubmit)` renders `FormErrorBanner`
- [ ] `satisfies z.input<typeof schema>` on defaultValues
- [ ] Field schemas created via `useMemo(() => createXSchema(t.x), [t])`
- [ ] `getSurface` routes toast-class errors away from form
- [ ] `exceptionToFormErrors` maps API errors to field errors
- [ ] Success = `null`, never `undefined` with side effects half-done
