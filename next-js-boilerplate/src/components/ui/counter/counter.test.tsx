import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Counter } from "./counter";

vi.mock("@/hooks/useComponentVariant", () => ({
  useComponentVariant: () => "default",
}));

describe("Counter", () => {
  it("increments and decrements value", () => {
    render(<Counter label="qty" />);
    const display = screen.getByText("0");
    const inc = screen.getByLabelText("Increase qty");
    const dec = screen.getByLabelText("Decrease qty");

    expect(display).toBeTruthy();
    expect((dec as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(inc);
    expect(display.textContent).toBe("1");
    expect((dec as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(inc);
    expect(display.textContent).toBe("2");
  });

  it("calls onChange when controlled", () => {
    const onChange = vi.fn();
    render(<Counter label="qty" value={3} onChange={onChange} />);
    const inc = screen.getByLabelText("Increase qty");
    fireEvent.click(inc);
    expect(onChange).toHaveBeenCalledWith(4);
  });
});
