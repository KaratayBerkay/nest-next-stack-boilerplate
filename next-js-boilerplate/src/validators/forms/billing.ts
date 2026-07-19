import { z } from "zod";

export const billingSchema = z.object({
  plan: z.string().min(1),
  billingPeriod: z.enum(["monthly", "yearly"]),
  paymentMethod: z.string().min(1),
  couponCode: z.string().optional(),
  taxId: z.string().optional(),
});

export const billingFieldSchemas = {
  plan: z.string().min(1),
  billingPeriod: z.enum(["monthly", "yearly"]),
};
