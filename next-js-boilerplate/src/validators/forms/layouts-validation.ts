import { z } from "zod";

export const contactFieldSchemas = {
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required"),
} as const;

export const twoColumnFieldSchemas = {
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required"),
} as const;

export const iconFieldSchemas = {
  name: z.string().min(2, "Name is required"),
  mail: z.string().email("Invalid email"),
  lock: z.string().min(6, "Password must be at least 6 characters"),
} as const;

export const sectionedFieldSchemas = {
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email"),
  street: z.string().min(3, "Street is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().min(3, "ZIP code is required"),
} as const;
