import { z } from "zod";

export const elementsFieldSchemas = {
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  bio: z.string().max(200, "Bio must be 200 characters or fewer"),
} as const;
