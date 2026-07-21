import { formOptions } from "@tanstack/react-form";

export const basicFormOpts = formOptions({
  defaultValues: {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
});

export const twoColumnFormOpts = formOptions({
  defaultValues: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  },
});

export const iconFormOpts = formOptions({
  defaultValues: {
    name: "",
    mail: "",
    lock: "",
  },
});

export const sectionedFormOpts = formOptions({
  defaultValues: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    plan: "free" as "free" | "basic" | "premium",
    agree: false,
  },
});
