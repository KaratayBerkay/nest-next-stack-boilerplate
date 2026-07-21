import { z } from "zod";

export const basicFormSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const twoColumnFormSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Phone is required"),
});

export const iconFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  mail: z.string().email("Invalid email"),
  lock: z.string().min(6, "Password must be at least 6 characters"),
});

export const sectionedFormSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(6, "Phone is required"),
  street: z.string().min(3, "Street is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().min(3, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  plan: z.enum(["free", "basic", "premium"]),
  agree: z
    .boolean()
    .refine((val) => val === true, "You must agree to the terms"),
});
