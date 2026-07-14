import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Accordion } from "./accordion";
import { AccordionItem } from "./accordion-item";
import { AccordionTrigger } from "./accordion-trigger";
import { AccordionContent } from "./accordion-content";
import { AccordionItemComplex } from "./accordion-item-complex";

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ componentStyle: "default" as const }),
}));

describe("Accordion", () => {
  it("toggles data-state and mounts/unmounts content on trigger click", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>Section A</AccordionTrigger>
          <AccordionContent>Panel A body</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const trigger = screen.getByRole("button", { name: /section a/i });
    expect(trigger.getAttribute("data-state")).toBe("closed");
    expect(screen.queryByText("Panel A body")).toBeNull();

    fireEvent.click(trigger);
    expect(trigger.getAttribute("data-state")).toBe("open");
    expect(screen.getByText("Panel A body")).toBeDefined();

    fireEvent.click(trigger);
    expect(trigger.getAttribute("data-state")).toBe("closed");
  });
});

describe("AccordionItemComplex", () => {
  it("collapses and expands through the real Radix primitives", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItemComplex
          value="rich"
          trigger="Rich item"
          upper="Category"
          content="Rich content body"
        />
      </Accordion>,
    );
    const trigger = screen.getByRole("button", { name: /rich item/i });
    expect(trigger.getAttribute("data-state")).toBe("closed");
    expect(screen.queryByText("Rich content body")).toBeNull();

    fireEvent.click(trigger);
    expect(trigger.getAttribute("data-state")).toBe("open");
    expect(screen.getByText("Rich content body")).toBeDefined();

    fireEvent.click(trigger);
    expect(trigger.getAttribute("data-state")).toBe("closed");
  });
});
