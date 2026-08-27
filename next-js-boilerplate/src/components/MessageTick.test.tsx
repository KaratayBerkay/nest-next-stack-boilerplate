import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageTick } from "@/components/MessageTick";

describe("MessageTick", () => {
  it("renders the sent tick for status=sent", () => {
    render(<MessageTick status="sent" />);
    expect(screen.getByTestId("tick-sent")).toBeTruthy();
  });

  it("renders the delivered tick for status=delivered", () => {
    render(<MessageTick status="delivered" />);
    expect(screen.getByTestId("tick-delivered")).toBeTruthy();
  });

  it("renders the read tick for status=read", () => {
    render(<MessageTick status="read" />);
    expect(screen.getByTestId("tick-read")).toBeTruthy();
  });

  it("renders a distinct failed indicator for status=failed", () => {
    render(<MessageTick status="failed" />);
    expect(screen.getByTestId("tick-failed")).toBeTruthy();
    expect(screen.queryByTestId("tick-sent")).toBeNull();
  });

  it("exposes an accessible label on the failed indicator when provided", () => {
    render(<MessageTick status="failed" failedLabel="Failed to send" />);
    expect(screen.getByRole("img", { name: "Failed to send" })).toBeTruthy();
  });

  it("omits the img role on the failed indicator when no label is provided", () => {
    render(<MessageTick status="failed" />);
    expect(screen.queryByRole("img")).toBeNull();
  });
});
