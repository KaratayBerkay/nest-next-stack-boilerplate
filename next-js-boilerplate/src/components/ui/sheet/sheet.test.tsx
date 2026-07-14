import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Sheet, SheetContent, SheetTitle } from "./sheet";

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ componentStyle: "default" as const }),
}));

describe("SheetContent theme canary", () => {
  // Regression gate for ui-upgrade-4 T2: the sheet panel shipped once with
  // no background class at all and rendered fully transparent.
  it.each(["top", "bottom", "left", "right"] as const)(
    "keeps bg-bg and border tokens on the %s panel",
    (side) => {
      render(
        <Sheet open onOpenChange={() => {}}>
          <SheetContent side={side}>
            <SheetTitle>Panel</SheetTitle>
          </SheetContent>
        </Sheet>,
      );
      const panel = document.querySelector('[role="dialog"]');
      expect(panel).not.toBeNull();
      expect(panel!.className).toContain("bg-bg");
      expect(panel!.className).toContain("border-border");
      expect(panel!.className).toContain("text-fg");
    },
  );
});
