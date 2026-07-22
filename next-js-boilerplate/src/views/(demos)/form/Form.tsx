"use client";

import { useActionState, useState } from "react";
import {
  initialFormState,
  mergeForm,
  useForm,
  useStore,
  useTransform,
} from "@tanstack/react-form-nextjs";
import { fieldSchemas } from "@/validators/demos/form-schema";
import { signupFormOpts } from "@/lib/forms/signup-options";
import { signupAction } from "@/features/auth/actions/signup";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { FieldInfo } from "./FieldInfo";
import { FormBanner } from "./FormBanner";

export function SignupForm() {
  const [state, action] = useActionState(signupAction, initialFormState);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    ...signupFormOpts,
    transform: useTransform((baseForm) => mergeForm(baseForm, state!), [state]),
    onSubmit: async () => {
      setSubmitted(true);
    },
  });

  const formErrors = useStore(form.store, (formState) => formState.errors);

  return (
    <form
      action={action as never}
      onSubmit={() => form.handleSubmit()}
      className="flex flex-col gap-4"
    >
      {submitted && formErrors.length === 0 && (
        <FormBanner type="success" messages={["Thanks for signing up!"]} />
      )}

      <FormBanner
        type="error"
        messages={formErrors.map((e) => String(e))}
      />

      <form.Field
        name="name"
        validators={{ onChange: fieldSchemas.name, onBlur: fieldSchemas.name }}
      >
        {(field) => (
          <div className="flex flex-col gap-1">
            <Label htmlFor={field.name}>Name</Label>
            <Input
              id={field.name}
              name={field.name}
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
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
            <Label htmlFor={field.name}>Email</Label>
            <Input
              id={field.name}
              name={field.name}
              type="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
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
            <Label htmlFor={field.name}>Age</Label>
            <Input
              id={field.name}
              name={field.name}
              type="number"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              data-testid="field-age"
            />
            <FieldInfo field={field} />
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit}
            className="self-start"
            data-testid="form-submit"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
