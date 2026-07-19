import { describe, it, expect } from "vitest";
import { createBillingInitialValues, billingDefaultValues } from "../billing-inits";
import { createCheckoutInitialValues } from "../checkout-inits";
import { createProfileInitialValues } from "../profile-inits";
import { createEditorInitialValues } from "../editor-inits";
import { createInviteInitialValues } from "../invite-inits";

describe("createBillingInitialValues", () => {
  it("returns a fresh copy (not same reference) when called with no arg", () => {
    const result = createBillingInitialValues();
    expect(result).toEqual(billingDefaultValues);
    expect(result).not.toBe(billingDefaultValues);
  });

  it("merges a partial record (no default fill — spread only)", () => {
    const result = createBillingInitialValues({ plan: "free", billingPeriod: "yearly" } as Parameters<typeof createBillingInitialValues>[0]);
    expect(result.plan).toBe("free");
    expect(result.billingPeriod).toBe("yearly");
    expect(result.paymentMethod).toBeUndefined();
  });

  it("accepts out-of-enum plan and keeps it (no narrow guard needed)", () => {
    const result = createBillingInitialValues({ plan: "unknown" } as Parameters<typeof createBillingInitialValues>[0]);
    expect(result.plan).toBe("unknown");
  });
});

describe("createCheckoutInitialValues", () => {
  it("returns a fresh copy when called with no arg", () => {
    const result = createCheckoutInitialValues();
    expect(result.sameAsShipping).toBe(false);
    expect(result.shippingAddress).not.toBe(result.billingAddress);
  });

  it("merges a partial record with default fill on nested address objects", () => {
    const result = createCheckoutInitialValues({
      email: "test@test.com",
      sameAsShipping: true,
      confirmEmail: "test@test.com",
      paymentMethod: "paypal",
      shippingAddress: { street: "1 Main", city: "", province: "", postalCode: "", country: "us", phone: "" },
      billingAddress: { street: "2 Main", city: "", province: "", postalCode: "", country: "us", phone: "" },
    });
    expect(result.email).toBe("test@test.com");
    expect(result.paymentMethod).toBe("paypal");
  });
});

describe("createProfileInitialValues", () => {
  it("returns a fresh shallow copy when called with no arg", () => {
    const result = createProfileInitialValues();
    expect(result.firstName).toBe("");
    expect(result).not.toBe(createProfileInitialValues());
  });

  it("preserves undefined birthDate as undefined default", () => {
    const result = createProfileInitialValues({ firstName: "Test" } as Parameters<typeof createProfileInitialValues>[0]);
    expect(result.firstName).toBe("Test");
    expect(result.birthDate).toBeUndefined();
  });
});

describe("createEditorInitialValues", () => {
  it("returns a fresh copy when called with no arg", () => {
    const result = createEditorInitialValues();
    expect(result.title).toBe("");
    expect(result.tags).toEqual([]);
  });

  it("merges a partial record (no default fill — spread only)", () => {
    const result = createEditorInitialValues({ title: "Hello" } as Parameters<typeof createEditorInitialValues>[0]);
    expect(result.title).toBe("Hello");
    expect(result.slug).toBeUndefined();
  });
});

describe("createInviteInitialValues", () => {
  it("returns a fresh copy when called with no arg", () => {
    const result = createInviteInitialValues();
    expect(result.emails).toEqual([]);
    expect(result.role).toBe("member");
  });

  it("merges a partial record (no default fill — spread only)", () => {
    const result = createInviteInitialValues({ role: "admin" } as Parameters<typeof createInviteInitialValues>[0]);
    expect(result.role).toBe("admin");
    expect(result.message).toBeUndefined();
  });
});
