import { z } from "zod";

export const fieldStateSchemas = {
  name: z.string().min(2, "At least 2 characters"),
  email: z.string().email("Invalid email"),
  role: z.string().min(1, "Select a role"),
};
