# TanStack Form + Next.js 16 App Router

## Package Versions (2026)

- `@tanstack/react-form` — v1.x (released, stable)
- `@tanstack/react-form-nextjs` — v1.x (replaces `@tanstack/react-form` imports on server)
- `zod` — v4.x (has breaking changes from v3; use `z.z.object({...})` not `z.object({...})`)

## Installation

```
pnpm add @tanstack/react-form @tanstack/react-form-nextjs
```

## Zod v4 vs Standard Schema

Zod v4 supports the **Standard Schema** spec natively (via `schema['~standard']`).  
TanStack Form v1.x accepts Standard Schema directly in the `validators` prop — **no adapter needed**.

```ts
import { z } from "zod";

const userSchema = z.z.object({
  name: z.z.string().min(1, "Name is required"),
  email: z.z.string().email("Invalid email"),
  age: z.z.number().min(18, "Must be 18+"),
});
```

## Architecture Pattern

### 1. Shared config (`formOptions`)

Create a file that exports `formOptions` with `defaultValues`.  
**Important**: server-side imports use `@tanstack/react-form-nextjs`, client-side uses `@tanstack/react-form`.  
The `formOptions` factory works the same in both — only the module path differs.

```ts
// src/lib/forms/signup-options.ts
import { formOptions } from "@tanstack/react-form";

export const signupFormOpts = formOptions({
  defaultValues: {
    name: "",
    email: "",
    age: 0,
  },
});
```

### 2. Server Action (server-side validation)

Use `createServerValidate` from `@tanstack/react-form-nextjs` and wrap in a `'use server'` function.

```ts
// src/actions/signup.ts
"use server";

import {
  ServerValidateError,
  createServerValidate,
} from "@tanstack/react-form-nextjs";
import { z } from "zod";
import { signupFormOpts } from "@/lib/forms/signup-options";

const signupSchema = z.z.object({
  name: z.z.string().min(1, "Name is required"),
  email: z.z.string().email("Invalid email"),
  age: z.z.number().min(18, "Must be 18+"),
});

const serverValidate = createServerValidate({
  ...signupFormOpts,
  onServerValidate: ({ value }) => {
    const result = signupSchema["~standard"].validate(value);
    if (result.issues) {
      return result.issues.map((i) => i.message).join(", ");
    }
  },
});

export async function signupAction(prev: unknown, formData: FormData) {
  try {
    const validatedData = await serverValidate(formData);
    // Persist validatedData ...
    return { success: true };
  } catch (e) {
    if (e instanceof ServerValidateError) {
      return e.formState;
    }
    throw e;
  }
}
```

### 3. Client Component

Uses `useActionState`, `useForm`, `useTransform`, `mergeForm` and `initialFormState` from `@tanstack/react-form-nextjs`.

```tsx
"use client";

import { useActionState } from "react";
import {
  initialFormState,
  mergeForm,
  useForm,
  useStore,
  useTransform,
} from "@tanstack/react-form-nextjs";
import { signupFormOpts } from "@/lib/forms/signup-options";
import { signupAction } from "@/actions/signup";
import { z } from "zod";

const clientSchema = z.z.object({
  name: z.z.string().min(1, "Name is required"),
  email: z.z.string().email("Invalid email"),
  age: z.z.number().min(18, "Must be 18+"),
});

export function SignupForm() {
  const [state, action] = useActionState(signupAction, initialFormState);

  const form = useForm({
    ...signupFormOpts,
    transform: useTransform((baseForm) => mergeForm(baseForm, state!), [state]),
    validators: { onChange: clientSchema },
  });

  const formErrors = useStore(form.store, (state) => state.errors);

  return (
    <form action={action as never} onSubmit={() => form.handleSubmit()}>
      {formErrors.map((error) => (
        <p key={error as string} className="text-sm text-red-500">
          {error}
        </p>
      ))}

      <form.Field
        name="name"
        children={(field) => (
          <div>
            <label htmlFor={field.name}>Name</label>
            <input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldInfo field={field} />
          </div>
        )}
      />

      <form.Field
        name="email"
        children={(field) => (
          <div>
            <label htmlFor={field.name}>Email</label>
            <input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldInfo field={field} />
          </div>
        )}
      />

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <button type="submit" disabled={!canSubmit}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        )}
      />
    </form>
  );
}

function FieldInfo({ field }: { field: any }) {
  return (
    <>
      {field.state.meta.touchedErrors?.length > 0 && (
        <p className="text-xs text-red-500">
          {field.state.meta.touchedErrors.join(", ")}
        </p>
      )}
      {field.state.meta.isValidating && (
        <span className="text-xs text-zinc-400">Validating...</span>
      )}
    </>
  );
}
```

## Key Patterns

### Client-side validation

Pass a Standard Schema to `validators: { onChange: schema }`.

### Server-side validation

Use `createServerValidate` with `onServerValidate` callback.

### Merging server state

`useActionState` stores the returned form state. `useTransform` + `mergeForm` integrates it into the client form.

### Field state (v1 API)

- `field.state.value` — current value
- `field.state.meta.errors` — all errors from current validation (array)
- `field.state.meta.errorMap` — errors mapped by validation trigger
- `field.state.meta.isValidating` — async validation in progress
- `field.state.meta.isTouched` — field has been interacted with
- `field.state.meta.isDirty` — field value has changed (persistent: stays true even if reverted)
- `field.state.meta.isPristine` — opposite of isDirty
- `field.state.meta.isBlurred` — field has lost focus

### Performance

- Use `form.Subscribe` with a `selector` to limit re-renders
- Use `useStore(form.store, selector)` for reading values reactively
- Fields only re-render their own subtree (observer pattern)

### Form-level subscribe

```tsx
<form.Subscribe
  selector={(state) => [state.canSubmit, state.isSubmitting]}
  children={([canSubmit, isSubmitting]) => (
    <button disabled={!canSubmit}>{isSubmitting ? "..." : "Submit"}</button>
  )}
/>
```

### Reset

```tsx
<button type="button" onClick={() => form.reset()}>
  Reset
</button>
```

## Limitations / Gotchas

- `@tanstack/react-form-nextjs` must be used for server-side code in Next.js (distinct module path).
- Use `"use client"` for client components using `useForm`.
- Zod v4 API: `z.z.object({ ... })` not `z.object({ ... })`.
- Server Action signature: `(prev: unknown, formData: FormData) => Promise<...>`.
