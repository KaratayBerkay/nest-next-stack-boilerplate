import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { useState } from "react";
import { Select } from "./select";
import { SelectTrigger } from "./select-trigger";
import { SelectContent } from "./select-content";
import { SelectItem } from "./select-item";
import { SelectValue } from "./select-value";

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ componentStyle: "default" as const }),
}));

beforeAll(() => {
  // jsdom has no matchMedia; the listbox needs the desktop branch.
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
  // jsdom has no scrollIntoView; focusItem calls it on every focus move.
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

function DemoSelect() {
  const [value, setValue] = useState<string | undefined>(undefined);
  return (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger>
        <SelectValue placeholder="Pick one" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana" disabled>
          Banana
        </SelectItem>
        <SelectItem value="cherry">Cherry</SelectItem>
        <SelectItem value="js">
          <em>Java</em>Script
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

function openSelect() {
  fireEvent.click(screen.getByRole("button", { name: /pick one/i }));
}

describe("SelectItem disabled state", () => {
  it("marks disabled items with data-disabled and aria-disabled", () => {
    render(<DemoSelect />);
    openSelect();
    const banana = screen.getByRole("option", { name: "Banana" });
    expect(banana.hasAttribute("data-disabled")).toBe(true);
    expect(banana.getAttribute("aria-disabled")).toBe("true");
    const apple = screen.getByRole("option", { name: "Apple" });
    expect(apple.hasAttribute("data-disabled")).toBe(false);
  });

  it("skips disabled options on ArrowDown", () => {
    render(<DemoSelect />);
    openSelect();
    // Initial focus lands on the first enabled option.
    expect(document.activeElement?.textContent).toContain("Apple");
    fireEvent.keyDown(screen.getByRole("listbox"), { key: "ArrowDown" });
    // Banana is disabled, so focus jumps straight to Cherry.
    expect(document.activeElement?.textContent).toContain("Cherry");
  });

  it("does not select a disabled item on click", () => {
    render(<DemoSelect />);
    openSelect();
    fireEvent.click(screen.getByRole("option", { name: "Banana" }));
    expect(
      screen.getByRole("button", { name: /pick one/i }).textContent,
    ).toContain("Pick one");
  });
});

describe("SelectItem non-string labels", () => {
  it("shows the textContent of JSX children in the trigger after selection", () => {
    render(<DemoSelect />);
    openSelect();
    fireEvent.click(screen.getByRole("option", { name: "JavaScript" }));
    expect(screen.getByRole("button").textContent).toContain("JavaScript");
  });
});
