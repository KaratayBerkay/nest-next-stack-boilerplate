import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(1, "Server: Name is required"),
  email: z.string().email("Server: Invalid email"),
  age: z.number().min(18, "Server: Must be 18 or older"),
});
