/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createUsernameValidator, createEmailValidator } from "./profile-validators";
import type { ProfileFieldsProps } from "./ProfileFields-types";

export function ProfileBasicFields({
  form,
  fieldSchemas,
  usernameAvailable,
  setUsernameAvailable,
  t,
  checkUsername,
  simulateError,
  toast,
  allMessages,
}: ProfileFieldsProps) {
  const profile = t.profile as Record<string, string>;

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <form.AppField
          name="firstName"
          validators={{ onChange: (fieldSchemas as any).firstName }}
        >
          {(field: any) => <field.TextField label={profile.firstName} required />}
        </form.AppField>
        <form.AppField
          name="lastName"
          validators={{ onChange: (fieldSchemas as any).lastName }}
        >
          {(field: any) => <field.TextField label={profile.lastName} required />}
        </form.AppField>
      </div>

      <form.AppField
        name="username"
        listeners={{
          onChange: () => setUsernameAvailable(false),
        }}
        validators={{
          onChange: (fieldSchemas as any).username,
          ...createUsernameValidator(checkUsername, setUsernameAvailable, profile.usernameTaken),
        }}
      >
        {(field: any) => (
          <div className="flex flex-col gap-0.5">
            <field.TextField label={profile.username} hint={profile.usernameHint} required />
            {usernameAvailable && (
              <span className="text-xxs text-green-600">
                {profile.usernameAvailable}
              </span>
            )}
          </div>
        )}
      </form.AppField>

      <form.AppField
        name="email"
        validators={{
          onChange: (fieldSchemas as any).email,
          ...createEmailValidator(
            (fieldSchemas as any).email,
            simulateError,
            toast,
            allMessages,
          ),
        }}
      >
        {(field: any) => <field.TextField label={profile.email} required />}
      </form.AppField>

      <form.AppField name="bio">
        {(field: any) => (
          <field.TextareaField
            label={profile.bio}
            hint={profile.bioHint}
          />
        )}
      </form.AppField>
    </>
  );
}
