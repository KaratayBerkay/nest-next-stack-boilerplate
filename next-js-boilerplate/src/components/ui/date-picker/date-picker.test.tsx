import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { DatePicker } from "./date-picker";

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ componentStyle: "default" as const }),
}));

beforeAll(() => {
  // jsdom has no matchMedia; the picker popover needs the desktop branch.
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: true,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

function openPicker() {
  fireEvent.click(screen.getByRole("button", { name: /pick a date/i }));
}

describe("DatePicker month grid", () => {
  it("selects a month and reports the first of that month", () => {
    const onChange = vi.fn();
    render(<DatePicker picker="month" onChange={onChange} />);
    openPicker();
    fireEvent.click(screen.getByRole("button", { name: "Mar" }));
    expect(onChange).toHaveBeenCalledOnce();
    const selected: Date = onChange.mock.calls[0][0];
    expect(selected.getMonth()).toBe(2);
    expect(selected.getDate()).toBe(1);
    expect(selected.getFullYear()).toBe(new Date().getFullYear());
  });

  it("marks the selected month as pressed and shows it in the trigger", () => {
    render(
      <DatePicker
        picker="month"
        value={new Date(2026, 2, 1)}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Mar 2026")).toBeDefined();
  });

  it("navigates years from the month view header", () => {
    render(<DatePicker picker="month" onChange={vi.fn()} />);
    openPicker();
    const year = new Date().getFullYear();
    fireEvent.click(screen.getByRole("button", { name: "Next year" }));
    expect(screen.getByText(String(year + 1))).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Previous year" }));
    expect(screen.getByText(String(year))).toBeDefined();
  });
});

describe("DatePicker year grid", () => {
  it("selects a year and reports Jan 1 of that year", () => {
    const onChange = vi.fn();
    render(<DatePicker picker="year" onChange={onChange} />);
    openPicker();
    const year = new Date().getFullYear();
    fireEvent.click(screen.getByRole("button", { name: String(year) }));
    expect(onChange).toHaveBeenCalledOnce();
    const selected: Date = onChange.mock.calls[0][0];
    expect(selected.getFullYear()).toBe(year);
    expect(selected.getMonth()).toBe(0);
    expect(selected.getDate()).toBe(1);
  });

  it("pages the visible year range", () => {
    render(<DatePicker picker="year" onChange={vi.fn()} />);
    openPicker();
    const decadeStart = Math.floor(new Date().getFullYear() / 12) * 12;
    expect(
      screen.getByText(`${decadeStart}–${decadeStart + 11}`),
    ).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(
      screen.getByText(`${decadeStart + 12}–${decadeStart + 23}`),
    ).toBeDefined();
  });
});

describe("DatePicker view switching", () => {
  it("switches months → years and back", () => {
    render(<DatePicker picker="month" onChange={vi.fn()} />);
    openPicker();
    expect(screen.getByRole("button", { name: "Jan" })).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Pick year" }));
    expect(screen.queryByRole("button", { name: "Jan" })).toBeNull();
    const year = new Date().getFullYear();
    expect(screen.getByRole("button", { name: String(year) })).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("button", { name: "Jan" })).toBeDefined();
  });
});

describe("DatePicker clear", () => {
  it("clears the value from the trigger affordance", () => {
    const onChange = vi.fn();
    render(
      <DatePicker
        picker="month"
        value={new Date(2026, 2, 1)}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear date" }));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
