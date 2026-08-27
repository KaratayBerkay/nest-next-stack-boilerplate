import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AddPaymentMethodForm } from "../AddPaymentMethodForm";

const t = {
  loading: "Loading...",
  saving: "Saving…",
  savePaymentMethod: "Save card",
  initializePaymentFailed: "INIT_FAILED",
  validationFailed: "VALIDATION_FAILED",
  saveCardFailed: "SAVE_CARD_FAILED",
};

const createSetupIntentServerMock = vi.fn();
const submitMock = vi.fn();
const confirmSetupMock = vi.fn();

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => t,
}));
vi.mock("@/api/server/billing/stripe", () => ({
  createSetupIntentServer: () => createSetupIntentServerMock(),
}));
vi.mock("@/components/StripeProvider", () => ({
  StripeElements: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));
// Button renders through useComponentVariant, which needs a ThemeProvider
// this unit test doesn't set up — stub it to the default variant.
vi.mock("@/hooks/useComponentVariant", () => ({
  useComponentVariant: () => "default",
}));
vi.mock("@stripe/react-stripe-js", () => ({
  PaymentElement: () => null,
  useStripe: () => ({ confirmSetup: confirmSetupMock }),
  useElements: () => ({ submit: submitMock }),
}));

describe("AddPaymentMethodForm error messages", () => {
  it("reports the translated init-failure message when the setup intent can't be created and the error has no message", async () => {
    createSetupIntentServerMock.mockRejectedValueOnce(new Error(""));
    const onError = vi.fn();

    render(<AddPaymentMethodForm onSuccess={vi.fn()} onError={onError} />);

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith(t.initializePaymentFailed),
    );
  });

  it("reports the translated validation-failure message when elements.submit() fails with no message", async () => {
    createSetupIntentServerMock.mockResolvedValueOnce({
      clientSecret: "cs_test",
    });
    submitMock.mockResolvedValueOnce({ error: {} });
    const onError = vi.fn();

    render(<AddPaymentMethodForm onSuccess={vi.fn()} onError={onError} />);
    await waitFor(() => screen.getByText("Save card"));
    fireEvent.click(screen.getByText("Save card"));

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith(t.validationFailed),
    );
  });

  it("reports the translated save-card-failure message when confirmSetup() fails with no message", async () => {
    createSetupIntentServerMock.mockResolvedValueOnce({
      clientSecret: "cs_test",
    });
    submitMock.mockResolvedValueOnce({ error: undefined });
    confirmSetupMock.mockResolvedValueOnce({ error: {} });
    const onError = vi.fn();

    render(<AddPaymentMethodForm onSuccess={vi.fn()} onError={onError} />);
    await waitFor(() => screen.getByText("Save card"));
    fireEvent.click(screen.getByText("Save card"));

    await waitFor(() => expect(onError).toHaveBeenCalledWith(t.saveCardFailed));
  });
});
