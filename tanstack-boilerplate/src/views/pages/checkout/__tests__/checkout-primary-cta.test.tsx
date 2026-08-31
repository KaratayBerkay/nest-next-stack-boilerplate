import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import en from "@/generated/i18n-messages-en.json";
import { AccordionCheckout } from "../AccordionCheckout";
import { MultiStepCheckout } from "../MultiStepCheckout";

const pagesMessages = (en as Record<string, unknown>).pages;

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => pagesMessages,
}));
vi.mock("@/hooks/useComponentVariant", () => ({
  // Preserve the real contract: an explicit variant prop wins.
  useComponentVariant: (variant?: string) => variant ?? "default",
}));

const checkout = (pagesMessages as { checkout: Record<string, string> })
  .checkout;

describe("checkout final CTAs render as primary actions", () => {
  it("AccordionCheckout's place-order button carries the brand background", () => {
    render(<AccordionCheckout />);
    const cta = screen.getByRole("button", {
      name: checkout.checkout1PlaceOrderLabel,
    });
    expect(cta.className).toContain("bg-brand");
  });

  it("MultiStepCheckout's advance button carries the brand background", () => {
    render(<MultiStepCheckout />);
    const cta = screen.getByRole("button", { name: checkout.checkout12Next });
    expect(cta.className).toContain("bg-brand");
    const back = screen.getByRole("button", { name: checkout.checkout12Back });
    expect(back.className).not.toContain("bg-brand");
  });
});
