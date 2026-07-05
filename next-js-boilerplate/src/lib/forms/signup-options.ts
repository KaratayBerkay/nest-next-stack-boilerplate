import { formOptions } from "@tanstack/react-form";

interface SignupFormData {
  name: string;
  email: string;
  age: number;
}

export const signupFormOpts = formOptions({
  defaultValues: {
    name: "",
    email: "",
    age: 0,
  },
});
