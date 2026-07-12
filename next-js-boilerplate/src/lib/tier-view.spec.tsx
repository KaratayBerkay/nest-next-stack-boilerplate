import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { getTierView } from "./tier-view";
import type { ComponentType } from "react";

const FreeView: ComponentType = () => <span data-testid="view">Free</span>;
const BasicView: ComponentType = () => <span data-testid="view">Basic</span>;
const MediumView: ComponentType = () => <span data-testid="view">Medium</span>;
const PremiumView: ComponentType = () => (
  <span data-testid="view">Premium</span>
);

const views = {
  FREE: FreeView,
  BASIC: BasicView,
  MEDIUM: MediumView,
  PREMIUM: PremiumView,
};

describe("getTierView", () => {
  it("renders FreeView for FREE tier", () => {
    render(<>{getTierView("FREE", views)}</>);
    expect(screen.getByTestId("view").textContent).toBe("Free");
  });

  it("renders BasicView for BASIC tier", () => {
    render(<>{getTierView("BASIC", views)}</>);
    expect(screen.getByTestId("view").textContent).toBe("Basic");
  });

  it("renders MediumView for MEDIUM tier", () => {
    render(<>{getTierView("MEDIUM", views)}</>);
    expect(screen.getByTestId("view").textContent).toBe("Medium");
  });

  it("renders PremiumView for PREMIUM tier", () => {
    render(<>{getTierView("PREMIUM", views)}</>);
    expect(screen.getByTestId("view").textContent).toBe("Premium");
  });

  it("falls back to FreeView for null", () => {
    render(<>{getTierView(null, views)}</>);
    expect(screen.getByTestId("view").textContent).toBe("Free");
  });

  it("falls back to FreeView for undefined", () => {
    render(<>{getTierView(undefined, views)}</>);
    expect(screen.getByTestId("view").textContent).toBe("Free");
  });

  it("falls back to FreeView for unknown tier string", () => {
    render(<>{getTierView("UNKNOWN", views)}</>);
    expect(screen.getByTestId("view").textContent).toBe("Free");
  });
});
