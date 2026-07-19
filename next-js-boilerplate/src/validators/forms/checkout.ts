import { z } from "zod";

const DEFAULT_CHECKOUT_T: Record<string, string> = {
  streetRequired: "Street required",
  cityRequired: "City required",
  provinceRequired: "Province required",
  postalCodeInvalid: "Invalid postal code",
  emailInvalid: "Invalid email",
  paymentMethodRequired: "Payment method required",
};

export const checkoutSchema = createCheckoutSchema(DEFAULT_CHECKOUT_T);

export function createCheckoutSchema(t: Record<string, string>) {
  return z.object({
    shippingAddress: z.object({
      street: z.string().min(1, t.streetRequired ?? "Street required"),
      city: z.string().min(1, t.cityRequired ?? "City required"),
      province: z.string().min(1, t.provinceRequired ?? "Province required"),
      postalCode: z
        .string()
        .min(3, t.postalCodeInvalid ?? "Invalid postal code"),
      country: z.string().min(1, "Country required"),
      phone: z.string().optional(),
    }),
    billingAddress: z.object({
      street: z.string().min(1, t.streetRequired ?? "Street required"),
      city: z.string().min(1, t.cityRequired ?? "City required"),
      province: z.string().min(1, t.provinceRequired ?? "Province required"),
      postalCode: z
        .string()
        .min(3, t.postalCodeInvalid ?? "Invalid postal code"),
      country: z.string().min(1, "Country required"),
      phone: z.string().optional(),
    }),
    sameAsShipping: z.boolean(),
    email: z.string().email(t.emailInvalid ?? "Invalid email"),
    confirmEmail: z.string().email(t.emailInvalid ?? "Invalid email"),
    paymentMethod: z
      .string()
      .min(1, t.paymentMethodRequired ?? "Payment method required"),
  });
}
