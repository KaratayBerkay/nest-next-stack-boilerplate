import { z } from "zod";

export const profileSchema = z.object({
  avatar: z.array(z.any()).optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(2, "Username must be at least 2 characters").max(30).optional(),
  email: z.string().email("Invalid email").optional(),
  bio: z.string().max(500).optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  newsletter: z.boolean().optional(),
  interests: z.array(z.string()).optional(),
  role: z.string().optional(),
  birthDate: z.date().optional(),
  meetingTime: z.any().optional(),
  notificationPrefs: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
  }).optional(),
});

export function createProfileFieldSchemas(t: Record<string, string>) {
  return {
    firstName: z.string().min(1, t.firstNameRequired ?? "First name is required"),
    lastName: z.string().min(1, t.lastNameRequired ?? "Last name is required"),
    username: z.string().min(2, t.usernameMin ?? "Username must be at least 2 characters").max(30),
    email: z.string().email(t.emailInvalid ?? "Invalid email"),
  };
}
