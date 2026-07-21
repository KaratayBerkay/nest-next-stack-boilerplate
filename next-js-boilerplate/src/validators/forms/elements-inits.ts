import { formOptions } from "@tanstack/react-form";
import { elementsSchema } from "@/validators/forms/elements";

export const elementsFormOpts = formOptions({
  defaultValues: {
    email: "",
    phone: "",
    url: "",
    password: "",
    bio: "",
  },
  validators: {
    onChange: elementsSchema,
  },
});
