import { z } from "zod";

export const fieldSchemas = {
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18 or older"),
};
