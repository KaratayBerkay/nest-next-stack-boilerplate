import { z } from "zod";

export const checkoutSchema = z.object({
  shippingAddress: z.object({
    street: z.string().min(1, "Street required"),
    city: z.string().min(1, "City required"),
    province: z.string().min(1, "Province required"),
    postalCode: z.string().min(3, "Invalid postal code"),
    country: z.string().min(1, "Country required"),
    phone: z.string().optional(),
  }),
  billingAddress: z.object({
    street: z.string().min(1, "Street required"),
    city: z.string().min(1, "City required"),
    province: z.string().min(1, "Province required"),
    postalCode: z.string().min(3, "Invalid postal code"),
    country: z.string().min(1, "Country required"),
    phone: z.string().optional(),
  }),
  sameAsShipping: z.boolean(),
  email: z.string().email("Invalid email"),
  confirmEmail: z.string().email("Invalid email"),
  paymentMethod: z.string().min(1),
});
