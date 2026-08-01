import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { InvoiceTable } from "../InvoiceTable";
import type { Transaction } from "@/types/billing/FreePageView-types";

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => ({
    invoices: "Invoices",
    loading: "Loading...",
    billingHistoryEmpty: "No invoices yet",
    invoiceNumber: "Invoice {number}",
    date: "Date",
    price: "Price",
    status: "Status",
    viewInvoice: "View invoice",
    paid: "Paid",
    unpaid: "Unpaid",
    showingXofY: "Showing {x}-{y} of {z}",
    previous: "Previous",
    next: "Next",
  }),
}));

function tx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "tx_1",
    type: "FEE",
    status: "COMPLETED",
    amount: 1999,
    currency: "USD",
    reference: "subscription:MEDIUM #1",
    createdAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("InvoiceTable currency display", () => {
  it("renders each row's own currency instead of a hardcoded $", () => {
    render(
      <InvoiceTable
        transactions={[tx({ amount: 1899, currency: "EUR" })]}
        isLoading={false}
      />,
    );
    expect(
      screen.getByText((text) => text.includes("18,99") && text.includes("€")),
    ).toBeTruthy();
  });

  it("does not append a recurring /mo cadence to a one-time invoice amount", () => {
    render(
      <InvoiceTable transactions={[tx({ amount: 999 })]} isLoading={false} />,
    );
    expect(screen.getByText("$9.99")).toBeTruthy();
    expect(screen.queryByText(/\/mo/)).toBeNull();
  });

  it("falls back to an em dash for a zero-amount row instead of $0.00", () => {
    render(
      <InvoiceTable
        transactions={[
          tx({ amount: 0, stripeInvoiceUrl: "https://stripe.test/inv_1" }),
        ]}
        isLoading={false}
      />,
    );
    expect(screen.getByText("—")).toBeTruthy();
    expect(screen.queryByText(/\$0\.00/)).toBeNull();
  });
});
