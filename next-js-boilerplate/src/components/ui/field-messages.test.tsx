import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useFieldMessages } from "./field-messages";

function TestComponent({
  error,
  description,
}: {
  error?: string;
  description?: string;
}) {
  const { describedBy, messages } = useFieldMessages(error, description);
  return (
    <div>
      <input aria-describedby={describedBy} data-testid="input" />
      <div data-testid="messages">{messages}</div>
    </div>
  );
}

describe("useFieldMessages", () => {
  it("returns undefined describedBy when no error or description", () => {
    render(<TestComponent />);
    const input = screen.getByTestId("input");
    expect(input.getAttribute("aria-describedby")).toBeNull();
  });

  it("renders nothing when no error or description", () => {
    render(<TestComponent />);
    const messages = screen.getByTestId("messages");
    expect(messages.innerHTML).toBe("");
  });

  it("renders error with role=alert and id that matches aria-describedby", () => {
    render(<TestComponent error="Required field" />);
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe("Required field");
    expect(alert.id).toBeTruthy();
    expect(document.getElementById(alert.id)).toBe(alert);

    const input = screen.getByTestId("input");
    expect(input.getAttribute("aria-describedby")).toBe(alert.id);
  });

  it("renders description with id that matches aria-describedby", () => {
    render(<TestComponent description="Must be unique" />);
    const desc = screen.getByText("Must be unique");
    expect(desc.id).toBeTruthy();
    expect(document.getElementById(desc.id)).toBe(desc);

    const input = screen.getByTestId("input");
    expect(input.getAttribute("aria-describedby")).toBe(desc.id);
  });

  it("both error and description ids resolve to real elements", () => {
    render(
      <TestComponent error="Invalid" description="Try again" />,
    );
    const input = screen.getByTestId("input");
    const describedBy = input.getAttribute("aria-describedby")!;
    expect(describedBy).toContain("-error");
    expect(describedBy).toContain("-description");

    const parts = describedBy.split(" ");
    for (const part of parts) {
      expect(document.getElementById(part)).not.toBeNull();
    }
  });

  it("error and description are both visible", () => {
    render(
      <TestComponent error="Too short" description="Min 8 chars" />,
    );
    expect(screen.getByText("Too short")).not.toBeNull();
    expect(screen.getByText("Min 8 chars")).not.toBeNull();
  });
});
