import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Counter } from "./counter";

describe("Counter", () => {
  it("increments its click count", () => {
    render(<Counter label="probe" />);
    const btn = screen.getByTestId("counter-probe");
    expect(btn.textContent).toMatch(/clicked 0 times/);

    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(btn.textContent).toMatch(/clicked 2 times/);
  });
});
