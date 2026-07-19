import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "@/lib/forms/form-context";
import { TextField } from "@/features/forms/ui/TextField";
import { TextareaField } from "@/features/forms/ui/TextareaField";
import { SelectField } from "@/features/forms/ui/SelectField";
import { ComboboxField } from "@/features/forms/ui/ComboboxField";
import { CheckboxField } from "@/features/forms/ui/CheckboxField";
import { SwitchField } from "@/features/forms/ui/SwitchField";
import { RadioGroupField } from "@/features/forms/ui/RadioGroupField";
import { DateField } from "@/features/forms/ui/DateField";
import { TimeField } from "@/features/forms/ui/TimeField";
import { UploadField } from "@/features/forms/ui/UploadField";
import { SubmitButton } from "@/features/forms/ui/SubmitButton";

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    TextField,
    TextareaField,
    SelectField,
    ComboboxField,
    CheckboxField,
    SwitchField,
    RadioGroupField,
    DateField,
    TimeField,
    UploadField,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});
