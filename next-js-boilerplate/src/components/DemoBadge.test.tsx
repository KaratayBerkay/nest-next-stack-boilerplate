import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DemoBadge } from "@/components/DemoBadge";

describe("DemoBadge", () => {
  it("renders its children", () => {
    render(<DemoBadge>Hello</DemoBadge>);
    expect(screen.getByText("Hello")).toBeTruthy();
  });

  it("merges an extra className with the module class", () => {
    render(<DemoBadge className="extra">Tag</DemoBadge>);
    expect(screen.getByText("Tag").className).toContain("extra");
  });
});
