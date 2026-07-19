import { formOptions } from "@tanstack/react-form";

export const signupFormOpts = formOptions({
  defaultValues: {
    name: "",
    email: "",
    age: 0,
  },
});
