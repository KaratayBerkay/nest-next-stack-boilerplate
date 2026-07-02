"use client";

import { useActionState, useState } from "react";
import {
  initialFormState,
  mergeForm,
  useForm,
  useStore,
  useTransform,
} from "@tanstack/react-form-nextjs";
import type { AnyFieldApi } from "@tanstack/react-form";
import { z } from "zod";
import { signupFormOpts } from "@/lib/forms/signup-options";
import { signupAction } from "@/features/auth/actions/signup";

// Per-field schemas. Using field-level validators (rather than a single
// form-level schema) keeps each field's errors independent: blurring one field
// only validates that field, so a stale "still invalid" error can't linger on a
// field the user later fixes without re-blurring it.
const fieldSchemas = {
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18 or older"),
};

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.errors.length > 0 && (
        <p className="text-xs text-red-500">
          {field.state.meta.errors
            .map((e) => (typeof e === "string" ? e : e?.message))
            .filter(Boolean)
            .join(", ")}
        </p>
      )}
      {field.state.meta.isValidating && (
        <span className="text-muted text-xs">Validating...</span>
      )}
    </>
  );
}

export function SignupForm() {
  const [state, action] = useActionState(signupAction, initialFormState);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    ...signupFormOpts,
    transform: useTransform((baseForm) => mergeForm(baseForm, state!), [state]),
    // Fires only after client validation passes. The native `action` below still
    // runs the Server Action so server-side validation happens too (defense in
    // depth — the client can be bypassed).
    onSubmit: async () => {
      setSubmitted(true);
    },
  });

  // Form-level errors, e.g. the message returned from the server action's
  // validation (merged in via `mergeForm`). Per-field schema errors are shown
  // inline by FieldInfo, so this banner only carries form-wide messages.
  const formErrors = useStore(form.store, (formState) => formState.errors);

  return (
    <form
      action={action as never}
      onSubmit={() => form.handleSubmit()}
      className="flex flex-col gap-4"
    >
      {submitted && formErrors.length === 0 && (
        <div
          className="rounded border border-green-300 bg-green-50 p-3 text-sm text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400"
          data-testid="form-success"
        >
          Thanks for signing up!
        </div>
      )}

      {formErrors.length > 0 && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400">
          {formErrors.map((error, i) => (
            <p key={i}>{String(error)}</p>
          ))}
        </div>
      )}

      <form.Field
        name="name"
        validators={{ onChange: fieldSchemas.name, onBlur: fieldSchemas.name }}
      >
        {(field) => (
          <div className="flex flex-col gap-1">
            <label
              htmlFor={field.name}
              className="text-muted text-xs font-semibold"
            >
              Name
            </label>
            <input
              id={field.name}
              name={field.name}
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border-border bg-surface rounded px-3 py-2 text-sm"
              data-testid="field-name"
            />
            <FieldInfo field={field} />
          </div>
        )}
      </form.Field>

      <form.Field
        name="email"
        validators={{
          onChange: fieldSchemas.email,
          onBlur: fieldSchemas.email,
        }}
      >
        {(field) => (
          <div className="flex flex-col gap-1">
            <label
              htmlFor={field.name}
              className="text-muted text-xs font-semibold"
            >
              Email
            </label>
            <input
              id={field.name}
              name={field.name}
              type="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border-border bg-surface rounded px-3 py-2 text-sm"
              data-testid="field-email"
            />
            <FieldInfo field={field} />
          </div>
        )}
      </form.Field>

      <form.Field
        name="age"
        validators={{ onChange: fieldSchemas.age, onBlur: fieldSchemas.age }}
      >
        {(field) => (
          <div className="flex flex-col gap-1">
            <label
              htmlFor={field.name}
              className="text-muted text-xs font-semibold"
            >
              Age
            </label>
            <input
              id={field.name}
              name={field.name}
              type="number"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              className="border-border bg-surface rounded px-3 py-2 text-sm"
              data-testid="field-age"
            />
            <FieldInfo field={field} />
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <button
            type="submit"
            disabled={!canSubmit}
            className="bg-fg text-bg self-start rounded px-4 py-2 text-sm disabled:opacity-40"
            data-testid="form-submit"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}
