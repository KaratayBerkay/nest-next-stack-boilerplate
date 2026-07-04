import { formOptions } from "@tanstack/react-form";

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export const loginFormOpts = formOptions({
  defaultValues: {
    email: "",
    password: "",
  } as LoginFormData,
});

export const registerFormOpts = formOptions({
  defaultValues: {
    name: "",
    email: "",
    password: "",
  } as RegisterFormData,
});
