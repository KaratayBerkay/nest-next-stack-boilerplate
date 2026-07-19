import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StepIndicator } from "./step-indicator";

const STEPS = ["Email", "Details", "Confirm"];

describe("StepIndicator", () => {
  it("renders all step labels", () => {
    render(<StepIndicator steps={STEPS} currentStep={0} />);
    STEPS.forEach((label) => {
      expect(screen.getByText(label)).toBeDefined();
    });
  });

  it("marks current step", () => {
    render(<StepIndicator steps={STEPS} currentStep={1} />);
    const step2 = screen.getByText("Details");
    expect(step2).toBeDefined();
  });
});
