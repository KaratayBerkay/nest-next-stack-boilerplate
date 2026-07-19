export const addressDefaults = {
  street: "",
  city: "",
  province: "",
  postalCode: "",
  country: "us" as const,
  phone: "",
}

export const checkoutDefaultValues = {
  shippingAddress: addressDefaults,
  billingAddress: addressDefaults,
  sameAsShipping: false,
  email: "",
  confirmEmail: "",
  paymentMethod: "stripe",
}

type CheckoutFormValues = typeof checkoutDefaultValues;

export function createCheckoutInitialValues(record?: CheckoutFormValues): CheckoutFormValues {
  if (!record) return { ...checkoutDefaultValues, shippingAddress: { ...addressDefaults }, billingAddress: { ...addressDefaults } };
  return {
    ...record,
    shippingAddress: { ...addressDefaults, ...record.shippingAddress },
    billingAddress: { ...addressDefaults, ...record.billingAddress },
  };
}
