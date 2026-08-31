import { z } from "zod";

export const elementsSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Phone number is required"),
  url: z.string().url("Enter a valid URL"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  bio: z.string().max(200, "Bio must be 200 characters or fewer"),
});
