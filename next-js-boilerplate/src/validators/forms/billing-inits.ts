import { z } from "zod";
import { billingSchema } from "./billing";

export const billingDefaultValues = {
  plan: "pro",
  billingPeriod: "monthly" as "monthly" | "yearly",
  paymentMethod: "visa",
  couponCode: "",
  taxId: "",
} satisfies z.input<typeof billingSchema>;

type BillingFormValues = typeof billingDefaultValues;

export function createBillingInitialValues(
  record?: BillingFormValues,
): BillingFormValues {
  if (!record) return { ...billingDefaultValues };
  return { ...record };
}
