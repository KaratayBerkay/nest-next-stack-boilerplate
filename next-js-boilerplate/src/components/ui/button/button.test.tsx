import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./button";

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ componentStyle: "default" as const }),
}));

describe("Button", () => {
  describe("loading state", () => {
    it("shows children with invisible class when loading", () => {
      render(<Button loading>Submit</Button>);
      const button = screen.getByRole("button");
      expect(button.getAttribute("aria-busy")).toBe("true");
      const childrenWrapper = button.querySelector("span");
      expect(childrenWrapper?.className).toContain("invisible");
      expect(screen.getByText("Submit")).toBeTruthy();
    });

    it("does not set aria-busy when not loading", () => {
      render(<Button>Submit</Button>);
      expect(screen.getByRole("button").getAttribute("aria-busy")).toBeNull();
    });
  });

  describe("asChild", () => {
    it("fires both child onClick and button onClick", () => {
      const childOnClick = vi.fn();
      const buttonOnClick = vi.fn();
      render(
        /* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
        <Button asChild onClick={buttonOnClick}>
          <span onClick={childOnClick}>Click me</span>
        </Button>
        /* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */,
      );
      const rendered = screen.getByText("Click me");
      fireEvent.click(rendered);
      expect(childOnClick).toHaveBeenCalledOnce();
      expect(buttonOnClick).toHaveBeenCalledOnce();
    });

    it("prevents button onClick if child defaultPrevented", () => {
      const childOnClick = vi.fn((e: React.MouseEvent) => {
        e.preventDefault();
      });
      const buttonOnClick = vi.fn();
      render(
        /* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
        <Button asChild onClick={buttonOnClick}>
          <span onClick={childOnClick}>Click me</span>
        </Button>
        /* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */,
      );
      fireEvent.click(screen.getByText("Click me"));
      expect(childOnClick).toHaveBeenCalledOnce();
      expect(buttonOnClick).not.toHaveBeenCalled();
    });
  });
});
