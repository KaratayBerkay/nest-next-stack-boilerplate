import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Calendar } from "./calendar";

describe("Calendar", () => {
  it("renders month caption with initial month", () => {
    render(<Calendar defaultMonth={new Date(2025, 0, 15)} />);
    expect(screen.getByText("January 2025")).toBeTruthy();
  });

  it("navigates to next month on next button click", () => {
    render(<Calendar defaultMonth={new Date(2025, 0, 15)} />);
    const nextBtn = screen.getByRole("button", {
      name: "Go to the Next Month",
    });
    fireEvent.click(nextBtn);
    expect(screen.getByText("February 2025")).toBeTruthy();
  });

  it("navigates to previous month on previous button click", () => {
    render(<Calendar defaultMonth={new Date(2025, 0, 15)} />);
    const prevBtn = screen.getByRole("button", {
      name: "Go to the Previous Month",
    });
    fireEvent.click(prevBtn);
    expect(screen.getByText("December 2024")).toBeTruthy();
  });

  it("calls onDayClick when a day is clicked", () => {
    const onDayClick = vi.fn();
    const { container } = render(
      <Calendar defaultMonth={new Date(2025, 0, 15)} onDayClick={onDayClick} />,
    );
    const dayButtons = container.querySelectorAll("button[data-day-button]");
    expect(dayButtons.length).toBeGreaterThan(0);
    const day15 = Array.from(dayButtons).find(
      (btn) => btn.textContent === "15",
    );
    expect(day15).toBeTruthy();
    fireEvent.click(day15!);
    expect(onDayClick).toHaveBeenCalledOnce();
    expect(onDayClick).toHaveBeenCalledWith(expect.any(Date));
  });
});
