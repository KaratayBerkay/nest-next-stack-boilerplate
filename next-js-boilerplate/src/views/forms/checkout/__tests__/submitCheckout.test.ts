import { describe, it, expect, vi } from "vitest";
import { submitCheckout } from "../PageContent";
import type { ExceptionResponse } from "@/lib/api-client";

function makeStubDeps() {
  return {
    simulateError: vi.fn().mockResolvedValue(undefined),
    toast: vi.fn(),
    allMessages: {},
  };
}

const defaultValue = {
  shippingAddress: { street: "123 Main", city: "NYC", province: "NY", postalCode: "10001", country: "us" as const, phone: "" },
  billingAddress: { street: "123 Main", city: "NYC", province: "NY", postalCode: "10001", country: "us" as const, phone: "" },
  sameAsShipping: true,
  email: "a@b.com",
  confirmEmail: "a@b.com",
  paymentMethod: "stripe",
};

describe("submitCheckout", () => {
  it("returns null on success", async () => {
    const deps = makeStubDeps();
    const result = await submitCheckout({ value: defaultValue }, deps);
    expect(result).toBeNull();
  });

  it("returns field errors from mapper on postal-code-group exception", async () => {
    const deps = makeStubDeps();
    deps.simulateError.mockRejectedValue({
      exception: {
        statusCode: 422,
        exc: "EX_VALIDATION_FORM",
        msg: "Invalid postal code",
        key: "errors.validation",
        fields: [{ field: "postalCode", msg: "Invalid format", key: "errors.invalid" }],
      } satisfies ExceptionResponse,
    });
    const result = await submitCheckout({
      value: { ...defaultValue, shippingAddress: { ...defaultValue.shippingAddress, postalCode: "00000" } },
    }, deps);
    expect(result).not.toBeNull();
    expect(result!.form).toBeNull();
    expect(result!.fields).toEqual({ postalCode: "Invalid format" });
  });

  it("calls deps.toast and returns null for toast-surface exception", async () => {
    const deps = makeStubDeps();
    deps.simulateError.mockRejectedValue({
      exception: {
        statusCode: 500,
        exc: "EX_INTERNAL",
        msg: "Payment declined",
        key: "errors.internal",
      } satisfies ExceptionResponse,
    });
    const result = await submitCheckout({ value: defaultValue }, deps);
    expect(result).toBeNull();
    expect(deps.toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "destructive" }),
    );
  });

  it("returns generic form error when no .exception on error", async () => {
    const deps = makeStubDeps();
    deps.simulateError.mockRejectedValue(new Error("Network failure"));
    const result = await submitCheckout({ value: defaultValue }, deps);
    expect(result).toEqual({ form: "Order failed", fields: {} });
  });
});
