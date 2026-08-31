"use client";

import { useMemo, useState } from "react";
import { useMessages, useAllMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { useProfileActions } from "@/api/client/profile/actions";
import { useFormsDemoActions } from "@/api/client/forms-demo/actions";
import { FormLevelError } from "@/components/ui/FormLevelError";
import { useAppForm } from "@/features/forms/form-hook";
import { createProfileFieldSchemas } from "@/validators/forms/profile";
import { profileFormOpts } from "./profile-constants";
import { submitProfile } from "./submit-profile";
export { submitProfile };
import { ProfileFields } from "./ProfileFields";

export default function ProfilePage() {
  const t = useMessages("forms");
  const allMessages = useAllMessages();
  const { toast } = useToast();
  const { updateProfile, checkUsername } = useProfileActions();
  const { simulateError } = useFormsDemoActions();
  const [usernameAvailable, setUsernameAvailable] = useState(false);
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
        <ProfileFields
          form={form}
          fieldSchemas={fieldSchemas}
          usernameAvailable={usernameAvailable}
          setUsernameAvailable={setUsernameAvailable}
          t={t}
          checkUsername={checkUsername}
          simulateError={simulateError}
          toast={toast}
          allMessages={allMessages}
        />

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
