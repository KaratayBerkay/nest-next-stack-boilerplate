import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MockCardForm } from "./mock-card-form";

vi.mock("@/lib/api-client", () => ({
  apiFetchJson: vi.fn(),
}));

describe("MockCardForm", () => {
  it("renders card inputs and submit button", () => {
    render(<MockCardForm tier="PREMIUM" />);
    expect(screen.getByTestId("card-number")).toBeDefined();
    expect(screen.getByTestId("exp-month")).toBeDefined();
    expect(screen.getByTestId("exp-year")).toBeDefined();
    expect(screen.getByTestId("cvc")).toBeDefined();
    expect(screen.getByTestId("cardholder-name")).toBeDefined();
    expect(screen.getByTestId("submit-payment")).toBeDefined();
  });

  it("shows test card buttons", () => {
    render(<MockCardForm tier="PREMIUM" />);
    expect(screen.getByTestId("test-card-4242")).toBeDefined();
    expect(screen.getByTestId("test-card-0002")).toBeDefined();
    expect(screen.getByTestId("test-card-9995")).toBeDefined();
  });

  it("fills card number when test card button clicked", () => {
    render(<MockCardForm tier="PREMIUM" />);
    fireEvent.click(screen.getByTestId("test-card-4242"));
    expect((screen.getByTestId("card-number") as HTMLInputElement).value).toContain("4242");
  });

  it("blocks invalid Luhn card client-side", async () => {
    render(<MockCardForm tier="PREMIUM" />);
    fireEvent.change(screen.getByTestId("card-number"), { target: { value: "0000000000000001" } });
    fireEvent.change(screen.getByTestId("exp-month"), { target: { value: "12" } });
    fireEvent.change(screen.getByTestId("exp-year"), { target: { value: "30" } });
    fireEvent.change(screen.getByTestId("cvc"), { target: { value: "123" } });
    fireEvent.change(screen.getByTestId("cardholder-name"), { target: { value: "Test" } });
    fireEvent.click(screen.getByTestId("submit-payment"));

    const { apiFetchJson } = await import("@/lib/api-client");
    expect(apiFetchJson).not.toHaveBeenCalled();
  });

  it("formats card number with spaces", () => {
    render(<MockCardForm tier="PREMIUM" />);
    fireEvent.change(screen.getByTestId("card-number"), { target: { value: "4242424242424242" } });
    expect((screen.getByTestId("card-number") as HTMLInputElement).value).toBe("4242 4242 4242 4242");
  });
});
