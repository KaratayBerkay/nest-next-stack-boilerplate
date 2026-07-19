import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Checkbox } from "./checkbox";
import { IndeterminateCheckbox } from "./indeterminate-checkbox";
import { CheckboxCard } from "./checkbox-card";

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ componentStyle: "default" as const }),
}));

describe("Checkbox", () => {
  it("toggles checked state on click", () => {
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange} />);
    const input = screen.getByRole("checkbox");
    fireEvent.click(input);
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("renders with label", () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText("Accept terms")).toBeTruthy();
  });
});

describe("IndeterminateCheckbox", () => {
  it("sets indeterminate on the input element", () => {
    render(<IndeterminateCheckbox indeterminate />);
    const input = screen.getByRole("checkbox") as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
  });

  it("does not set indeterminate when prop is false", () => {
    render(<IndeterminateCheckbox indeterminate={false} />);
    const input = screen.getByRole("checkbox") as HTMLInputElement;
    expect(input.indeterminate).toBe(false);
  });
});

describe("CheckboxCard", () => {
  it("toggles via clicking the checkbox input (Space/Enter in jsdom)", () => {
    const onChange = vi.fn();
    render(
      <CheckboxCard title="Option A" checked={false} onChange={onChange} />,
    );
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("toggles via label click", () => {
    const onChange = vi.fn();
    render(
      <CheckboxCard title="Option B" checked={false} onChange={onChange} />,
    );
    const label = screen.getByText("Option B").closest("label")!;
    fireEvent.click(label);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
