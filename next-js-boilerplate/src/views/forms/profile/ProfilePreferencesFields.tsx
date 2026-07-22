/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Separator } from "@/components/ui/Separator";
import { COUNTRY_OPTIONS, INTEREST_OPTIONS, LANGUAGE_OPTIONS, ROLE_OPTIONS } from "./profile-constants";
import type { ProfileFieldsProps } from "./ProfileFields-types";

export function ProfilePreferencesFields({
  form,
  t,
}: {
  form: ProfileFieldsProps["form"];
  t: ProfileFieldsProps["t"];
}) {
  const profile = t.profile as Record<string, string>;

  return (
    <>
      <Separator />

      <p className="text-xxs text-muted">{profile.demoOnlyFields}</p>

      <form.AppField name="country">
        {(field: any) => (
          <field.ComboboxField
            label={profile.country}
            options={COUNTRY_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
              group: o.group,
            }))}
          />
        )}
      </form.AppField>

      <form.AppField name="language">
        {(field: any) => (
          <field.SelectField
            label={profile.language}
            options={LANGUAGE_OPTIONS}
          />
        )}
      </form.AppField>

      <form.AppField name="newsletter">
        {(field: any) => <field.SwitchField label={profile.newsletter} />}
      </form.AppField>

      <form.AppField name="interests">
        {(field: any) => (
          <field.CheckboxField
            label={profile.interests}
            options={INTEREST_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
          />
        )}
      </form.AppField>

      <form.AppField name="role">
        {(field: any) => (
          <field.RadioGroupField
            label={profile.role}
            options={ROLE_OPTIONS}
          />
        )}
      </form.AppField>

      <form.AppField name="birthDate">
        {(field: any) => <field.DateField label={profile.birthDate} />}
      </form.AppField>

      <form.AppField name="meetingTime">
        {(field: any) => <field.TimeField label={profile.meetingTime} />}
      </form.AppField>
    </>
  );
}
