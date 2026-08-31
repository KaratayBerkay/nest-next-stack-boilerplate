import { formOptions } from "@tanstack/react-form";

export const basicFormOpts = formOptions({
  defaultValues: {
    fullName: "",
    email: "",
    subject: "",
    message: "",
  },
});

export const twoColumnFormOpts = formOptions({
  defaultValues: {
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  },
});

export const iconFormOpts = formOptions({
  defaultValues: {
    name: "",
    mail: "",
    lock: "",
    rememberMe: false,
  },
});

export const sectionedFormOpts = formOptions({
  defaultValues: {
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    category: "tech" as "tech" | "design" | "business",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    plan: "free" as "free" | "basic" | "premium",
    agree: false,
  },
});
