"use client";

import { useEffect, useMemo } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useAppForm } from "@/features/forms/form-hook";
import { formOptions, revalidateLogic } from "@tanstack/react-form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { FormFieldInfo } from "@/components/ui/FormFieldInfo";
import { createFieldStateSchemas } from "@/validators/forms/field-states";
import { z } from "zod";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

const validationFormOpts = formOptions({
  defaultValues: { name: "", email: "", role: "" },
});

function StateCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="surface border-border flex flex-col gap-2 rounded-lg border p-4">
      <p className="text-xxs text-muted tracking-wider uppercase">{label}</p>
      {children}
    </div>
  );
}

function FieldStatesGrid() {
  const t = useMessages("forms");
  const form = useAppForm({
    defaultValues: {
      defaultField: "",
      filledField: "Some value",
      errorField: "ab",
      warningField: "Edge case",
      disabledField: "Cannot edit",
      loadingField: "checking...",
      readOnlyField: "Read-only value",
      requiredField: "",
    },
  });

  useEffect(() => {
    form.setFieldMeta("loadingField", (prev) => ({
      ...prev,
      errors: [],
      isValidating: true,
    }));
  }, [form]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StateCard label={t.fieldStates.default}>
        <form.AppField name="defaultField">
          {(field) => <field.TextField />}
        </form.AppField>
      </StateCard>

      <StateCard label={t.fieldStates.filled}>
        <form.AppField name="filledField">
          {(field) => <field.TextField />}
        </form.AppField>
      </StateCard>

      <StateCard label={t.fieldStates.error}>
        <form.AppField
          name="errorField"
          validators={{
            onChange: z.string().min(3, "This field has an error"),
          }}
        >
          {(field) => <field.TextField />}
        </form.AppField>
      </StateCard>

      <StateCard label={t.fieldStates.warning}>
        <form.AppField name="warningField">
          {(field) => (
            <>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="border-warning"
              />
              <p className="text-warning text-xs">This value looks unusual</p>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <FormFieldInfo field={field as any} />
            </>
          )}
        </form.AppField>
      </StateCard>

      <StateCard label={t.fieldStates.disabled}>
        <form.AppField name="disabledField">
          {(field) => (
            <>
              <Input id={field.name} value={field.state.value} disabled />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <FormFieldInfo field={field as any} />
            </>
          )}
        </form.AppField>
      </StateCard>

      <StateCard label={t.fieldStates.loading}>
        <form.AppField name="loadingField">
          {(field) => <field.TextField />}
        </form.AppField>
      </StateCard>

      <StateCard label={t.fieldStates.readOnly}>
        <form.AppField name="readOnlyField">
          {(field) => (
            <>
              <Input id={field.name} value={field.state.value} readOnly />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <FormFieldInfo field={field as any} />
            </>
          )}
        </form.AppField>
      </StateCard>

      <StateCard label={t.fieldStates.required}>
        <form.AppField name="requiredField">
          {(field) => <field.TextField required />}
        </form.AppField>
      </StateCard>
    </div>
  );
}

function EagerForm() {
  const t = useMessages("forms");
  const fieldSchemas = useMemo(
    () => createFieldStateSchemas(t.fieldStates),
    [t],
  );
  const form = useAppForm({
    ...validationFormOpts,
  });

  return (
    <form className="flex flex-col gap-3">
      <form.AppField name="name" validators={{ onChange: fieldSchemas.name }}>
        {(field) => <field.TextField label="Name" />}
      </form.AppField>
      <form.AppField name="email" validators={{ onChange: fieldSchemas.email }}>
        {(field) => <field.TextField label="Email" />}
      </form.AppField>
      <form.AppField name="role" validators={{ onChange: fieldSchemas.role }}>
        {(field) => (
          <field.SelectField
            label="Role"
            options={ROLE_OPTIONS}
            placeholder="Select a role..."
          />
        )}
      </form.AppField>
    </form>
  );
}

function ClassicForm() {
  const t = useMessages("forms");
  const fieldSchemas = useMemo(
    () => createFieldStateSchemas(t.fieldStates),
    [t],
  );
  const form = useAppForm({
    ...validationFormOpts,
  });

  return (
    <form className="flex flex-col gap-3">
      <form.AppField name="name" validators={{ onBlur: fieldSchemas.name }}>
        {(field) => <field.TextField label="Name" />}
      </form.AppField>
      <form.AppField name="email" validators={{ onBlur: fieldSchemas.email }}>
        {(field) => <field.TextField label="Email" />}
      </form.AppField>
      <form.AppField name="role" validators={{ onBlur: fieldSchemas.role }}>
        {(field) => (
          <field.SelectField
            label="Role"
            options={ROLE_OPTIONS}
            placeholder="Select a role..."
          />
        )}
      </form.AppField>
    </form>
  );
}

function DynamicForm() {
  const t = useMessages("forms");
  const fieldSchemas = useMemo(
    () => createFieldStateSchemas(t.fieldStates),
    [t],
  );
  const form = useAppForm({
    ...validationFormOpts,
    validationLogic: revalidateLogic({ mode: "blur" }),
  });

  return (
    <form className="flex flex-col gap-3">
      <form.AppField name="name" validators={{ onDynamic: fieldSchemas.name }}>
        {(field) => <field.TextField label="Name" />}
      </form.AppField>
      <form.AppField
        name="email"
        validators={{ onDynamic: fieldSchemas.email }}
      >
        {(field) => <field.TextField label="Email" />}
      </form.AppField>
      <form.AppField name="role" validators={{ onDynamic: fieldSchemas.role }}>
        {(field) => (
          <field.SelectField
            label="Role"
            options={ROLE_OPTIONS}
            placeholder="Select a role..."
          />
        )}
      </form.AppField>
    </form>
  );
}

function ValidationModesSection() {
  const t = useMessages("forms");

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted text-xs">
        The same 3-field form mounted with three different validation
        strategies.
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
      </div>
    </div>
  );
}

function LinkedFieldsSection() {
  const t = useMessages("forms");
  const form = useAppForm({
    defaultValues: { password: "", confirmPassword: "" },
  });

  return (
    <div className="surface border-border flex flex-col gap-4 rounded-lg border p-4">
      <p className="text-xs font-medium">{t.fieldStates.linkedFields}</p>
      <p className="text-xxs text-muted">
        Changing the password field re-validates the confirm field. Uses{" "}
        <code>onChangeListenTo</code>.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.AppField name="password">
          {(field) => <field.TextField label={t.fieldStates.password} />}
        </form.AppField>
        <form.AppField
          name="confirmPassword"
          validators={{
            onChangeListenTo: ["password"],
            onChange: ({ value, fieldApi }) => {
              const pw = fieldApi.form.getFieldValue("password");
              return value === pw ? undefined : "Passwords must match";
            },
          }}
        >
          {(field) => <field.TextField label={t.fieldStates.confirmPassword} />}
        </form.AppField>
      </div>
    </div>
  );
}

function ProgrammaticMetaSection() {
  const form = useAppForm({
    defaultValues: { metaField: "" },
  });

  const handleSetError = () => {
    form.setFieldMeta("metaField", (prev) => ({
      ...prev,
      errors: ["Server rejected this value"],
      isValidating: false,
    }));
  };

  const handleSetValidating = () => {
    form.setFieldMeta("metaField", (prev) => ({
      ...prev,
      errors: [],
      isValidating: true,
    }));
  };

  const handleClear = () => {
    form.setFieldMeta("metaField", (prev) => ({
      ...prev,
      errors: [],
      isValidating: false,
    }));
  };

  return (
    <div className="surface border-border flex flex-col gap-4 rounded-lg border p-4">
      <p className="text-xs font-medium">Programmatic Field Meta</p>
      <p className="text-xxs text-muted">
        Setting meta via <code>form.setFieldMeta</code> — server errors,
        validating state.
      </p>

      <form.AppField name="metaField">
        {(field) => (
          <div className="flex flex-col gap-2">
            <field.TextField label="Target field" />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleSetError}
              >
                Set Error
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleSetValidating}
              >
                Set Validating
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleClear}
              >
                Clear
              </Button>
            </div>

            <div className="border-border bg-bg text-xxs mt-2 rounded border p-2 font-mono">
              <div>errors: {JSON.stringify(field.state.meta.errors)}</div>
              <div>isValidating: {String(field.state.meta.isValidating)}</div>
              <div>
                aria-invalid: {String(field.state.meta.errors.length > 0)}
              </div>
            </div>
          </div>
        )}
      </form.AppField>

      <div className="flex flex-wrap gap-2">
        <StateCard label="aria-invalid example">
          <Label htmlFor="a11y-invalid">Invalid input</Label>
          <Input
            id="a11y-invalid"
            aria-invalid
            placeholder="aria-invalid on this"
          />
        </StateCard>
        <StateCard label="aria-describedby example">
          <Label htmlFor="a11y-desc">Described input</Label>
          <Input
            id="a11y-desc"
            aria-describedby="desc-field-states"
            placeholder="Linked to description"
          />
          <p id="desc-field-states" className="text-xxs text-muted">
            This description is linked via aria-describedby
          </p>
        </StateCard>
      </div>
    </div>
  );
}

export default function FieldStatesPage() {
  const t = useMessages("forms");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.fieldStates.heading}</h2>
      </div>

      <section>
        <h3 className="text-muted mb-3 text-xs font-semibold tracking-wider uppercase">
          Field States
        </h3>
        <FieldStatesGrid />
      </section>

      <section>
        <h3 className="text-muted mb-3 text-xs font-semibold tracking-wider uppercase">
          {t.fieldStates.validationModes}
        </h3>
        <ValidationModesSection />
      </section>

      <section>
        <h3 className="text-muted mb-3 text-xs font-semibold tracking-wider uppercase">
          {t.fieldStates.linkedFields}
        </h3>
        <LinkedFieldsSection />
      </section>

      <section>
        <h3 className="text-muted mb-3 text-xs font-semibold tracking-wider uppercase">
          Programmatic Meta &amp; A11y
        </h3>
        <ProgrammaticMetaSection />
      </section>
    </div>
  );
}
