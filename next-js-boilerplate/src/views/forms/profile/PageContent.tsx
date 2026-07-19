"use client";

import { useMemo } from "react";
import { useMessages, useAllMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { useProfileActions } from "@/api/client/profile/actions";
import { getSurface, exceptionHandler } from "@/lib/exception-handler";
import { exceptionToFormErrors } from "@/lib/forms/exception-to-form-errors";
import { formOptions } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import { FormLevelError } from "@/components/ui/FormLevelError";
import { Separator } from "@/components/ui/Separator";
import type { ExceptionResponse } from "@/lib/api-client";
import { createProfileFieldSchemas } from "@/validators/forms/profile";
import { profileDefaultValues } from "@/validators/forms/profile-inits";
import { MAX_UPLOAD_SIZE } from "@/constants/upload";

const profileFormOpts = formOptions({
  defaultValues: profileDefaultValues,
});

const COUNTRY_OPTIONS = [
  { value: "us", label: "United States", group: "North America" },
  { value: "ca", label: "Canada", group: "North America" },
  { value: "gb", label: "United Kingdom", group: "Europe" },
  { value: "de", label: "Germany", group: "Europe" },
  { value: "tr", label: "Turkey", group: "Europe" },
  { value: "jp", label: "Japan", group: "Asia" },
];

const INTEREST_OPTIONS = [
  { value: "tech", label: "Technology" },
  { value: "design", label: "Design" },
  { value: "music", label: "Music" },
  { value: "sports", label: "Sports" },
  { value: "gaming", label: "Gaming" },
];

export async function submitProfile(
  { value }: { value: typeof profileFormOpts.defaultValues },
  deps: {
    updateProfile: (data: {
      name: string;
      username?: string;
      bio?: string;
      avatarUrl?: string;
    }) => Promise<void>;
    toast: ReturnType<typeof useToast>["toast"];
    messages: Record<string, unknown>;
    unknownError: string;
    saveSuccess: string;
  },
) {
  try {
    await deps.updateProfile({
      name: `${value.firstName} ${value.lastName}`.trim(),
      username: value.username || undefined,
      bio: value.bio || undefined,
      avatarUrl: value.avatar[0]?.preview || undefined,
    });
    deps.toast({ description: deps.saveSuccess, variant: "default" });
    return null;
  } catch (err) {
    const exc = (err as { exception?: ExceptionResponse }).exception;
    if (!exc) return { form: deps.unknownError, fields: {} };
    if (getSurface(exc.exc) === "toast") {
      deps.toast({
        description: exceptionHandler(exc, deps.messages),
        variant: "destructive",
      });
      return null;
    }
    return exceptionToFormErrors(exc, deps.messages);
  }
}

export default function ProfilePage() {
  const t = useMessages("forms");
  const allMessages = useAllMessages();
  const { toast } = useToast();
  const { updateProfile, checkUsername } = useProfileActions();
  const fieldSchemas = useMemo(() => createProfileFieldSchemas(t.profile), [t]);

  const form = useAppForm({
    ...profileFormOpts,
    validators: {
      onSubmitAsync: ({ value }) =>
        submitProfile(
          { value },
          {
            updateProfile,
            toast,
            messages: allMessages,
            unknownError: t.errors.unknown,
            saveSuccess: t.profile.saveSuccess,
          },
        ),
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.profile.heading}</h2>
        <p className="text-muted text-xs">{t.profile.demoOnlyFields}</p>
      </div>

      <FormLevelError form={form} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <form.AppField name="avatar">
          {(field) => (
            <field.UploadField
              label="Avatar"
              avatar
              maxSizeBytes={MAX_UPLOAD_SIZE}
            />
          )}
        </form.AppField>

        <div className="grid grid-cols-2 gap-4">
          <form.AppField
            name="firstName"
            validators={{ onChange: fieldSchemas.firstName }}
          >
            {(field) => <field.TextField label={t.profile.firstName} />}
          </form.AppField>
          <form.AppField
            name="lastName"
            validators={{ onChange: fieldSchemas.lastName }}
          >
            {(field) => <field.TextField label={t.profile.lastName} />}
          </form.AppField>
        </div>

        <form.AppField
          name="username"
          validators={{
            onChange: fieldSchemas.username,
            onChangeAsyncDebounceMs: 500,
            onChangeAsync: async ({ value }) => {
              if (!value) return undefined;
              return (await checkUsername(value))
                ? undefined
                : t.profile.usernameTaken;
            },
          }}
        >
          {(field) => <field.TextField label={t.profile.username} />}
        </form.AppField>

        <form.AppField
          name="email"
          validators={{ onChange: fieldSchemas.email }}
        >
          {(field) => <field.TextField label={t.profile.email} />}
        </form.AppField>

        <form.AppField name="bio">
          {(field) => <field.TextareaField label={t.profile.bio} />}
        </form.AppField>

        <Separator />

        <p className="text-xxs text-muted">{t.profile.demoOnlyFields}</p>

        <form.AppField name="country">
          {(field) => (
            <field.ComboboxField
              label={t.profile.country}
              options={COUNTRY_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
                group: o.group,
              }))}
            />
          )}
        </form.AppField>

        <form.AppField name="language">
          {(field) => (
            <field.SelectField
              label={t.profile.language}
              options={[
                { value: "en", label: "English" },
                { value: "tr", label: "Turkish" },
              ]}
            />
          )}
        </form.AppField>

        <form.AppField name="newsletter">
          {(field) => <field.SwitchField label={t.profile.newsletter} />}
        </form.AppField>

        <form.AppField name="interests">
          {(field) => (
            <field.CheckboxField
              label={t.profile.interests}
              options={INTEREST_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
            />
          )}
        </form.AppField>

        <form.AppField name="role">
          {(field) => (
            <field.RadioGroupField
              label={t.profile.role}
              options={[
                { value: "user", label: "User" },
                { value: "editor", label: "Editor" },
                { value: "admin", label: "Admin" },
              ]}
            />
          )}
        </form.AppField>

        <form.AppField name="birthDate">
          {(field) => <field.DateField label={t.profile.birthDate} />}
        </form.AppField>

        <form.AppField name="meetingTime">
          {(field) => <field.TimeField label={t.profile.meetingTime} />}
        </form.AppField>

        <form.AppForm>
          <form.SubmitButton
            label={t.profile.save}
            loadingLabel={t.profile.saving}
          />
        </form.AppForm>
      </form>
    </div>
  );
}
