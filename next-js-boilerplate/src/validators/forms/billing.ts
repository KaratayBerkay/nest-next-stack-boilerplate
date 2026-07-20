import { z } from "zod";

export const billingSchema = z.object({
  plan: z.string().min(1),
  billingPeriod: z.enum(["monthly", "yearly"]),
  paymentMethod: z.string().min(1),
  couponCode: z.string().optional(),
  taxId: z.string().optional(),
});

export function createBillingFieldSchemas(t: Record<string, string>) {
  return {
    plan: z.string().min(1, t.planRequired ?? "Plan is required"),
    billingPeriod: z.enum(["monthly", "yearly"], {
      message: t.periodRequired ?? "Billing period is required",
    }),
    taxId: z.string().optional(),
  };
}
