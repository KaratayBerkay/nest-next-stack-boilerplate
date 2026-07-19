import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormErrorBanner } from "./form-error-banner";

describe("FormErrorBanner", () => {
  it("renders error message with role='alert'", () => {
    render(<FormErrorBanner message="Something went wrong" onDismiss={() => {}} />);
    const alert = screen.getByRole("alert");
    expect(alert).toBeDefined();
    expect(screen.getByText("Something went wrong")).toBeDefined();
  });

  it("calls onDismiss when dismiss button clicked", () => {
    const onDismiss = vi.fn();
    render(<FormErrorBanner message="Error" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByLabelText("Dismiss"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
