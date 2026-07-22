import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useStore } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import { createFormSubmitHandler } from "@/lib/forms/shared";
import { iconFormOpts } from "@/validators/forms/layouts-inits";
import { iconFieldSchemas } from "@/validators/forms/layouts-validation";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { LayoutCard } from "./LayoutCard";
import { UserIcon, MailIcon, LockIcon } from "./icons";
import { IconField } from "./IconField";

export function IconPrefixedForm() {
  const t = useMessages("forms");
  const form = useAppForm({
    ...iconFormOpts,
  });
  const isDirty = useStore(form.store, (s) => s.isDirty);
  const onSubmit = createFormSubmitHandler(form);

  return (
    <LayoutCard
      label={t.layouts.icon_label}
      description={t.layouts.icon_description}
    >
      <form.AppForm>
        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
          <form.AppField
            name="name"
            validators={{ onChange: iconFieldSchemas.name }}
          >
            {(field) => (
              <IconField
                field={field}
                label={t.layouts.iconName_label}
                info={t.layouts.iconName_info}
                placeholder={t.layouts.iconName_placeholder}
                leftIcon={UserIcon}
              />
            )}
          </form.AppField>
          <form.AppField
            name="mail"
            validators={{ onChange: iconFieldSchemas.mail }}
          >
            {(field) => (
              <IconField
                field={field}
                label={t.layouts.iconEmail_label}
                info={t.layouts.iconEmail_info}
                placeholder={t.layouts.iconEmail_placeholder}
                leftIcon={MailIcon}
              />
            )}
          </form.AppField>
          <form.AppField
            name="lock"
            validators={{ onChange: iconFieldSchemas.lock }}
          >
            {(field) => (
              <IconField
                field={field}
                label={t.layouts.iconPassword_label}
                info={t.layouts.iconPassword_info}
                placeholder={t.layouts.iconPassword_placeholder}
                leftIcon={LockIcon}
                type="password"
              />
            )}
          </form.AppField>
          <form.AppField name="rememberMe">
            {(field) => (
              <div className="flex items-center gap-2 text-sm">
                <Checkbox
                  id={field.name}
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                />
                <Label htmlFor={field.name}>
                  {t.layouts.iconRemember_label}
                </Label>
                <FieldInfoButton description={t.layouts.iconRemember_info} />
              </div>
            )}
          </form.AppField>
          <div className="flex items-center justify-between">
            <form.SubmitButton label={t.layouts.iconSubmit} />
            {isDirty && (
              <span className="text-warning text-xxs flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                Unsaved changes
              </span>
            )}
          </div>
        </form>
      </form.AppForm>
    </LayoutCard>
  );
}
