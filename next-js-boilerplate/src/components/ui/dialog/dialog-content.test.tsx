import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { Dialog } from "./dialog";
import { DialogContent } from "./dialog-content";

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ componentStyle: "default" as const }),
}));

beforeAll(() => {
  // jsdom may lack <dialog> modal methods.
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
    this.open = false;
  };
});

describe("DialogContent theme canary", () => {
  // Regression gate for ui-upgrade-4 T1: the native <dialog> keeps its UA
  // white background unless the token classes are on the element itself.
  it("keeps bg-bg and border-border on the <dialog> element", () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <DialogContent>content</DialogContent>
      </Dialog>,
    );
    const dialog = document.querySelector("dialog");
    expect(dialog).not.toBeNull();
    expect(dialog!.className).toContain("bg-bg");
    expect(dialog!.className).toContain("border-border");
    expect(dialog!.className).toContain("text-fg");
  });
});

describe("DialogContent close-button label (A10 string override)", () => {
  it("defaults the close button label to 'Close'", () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <DialogContent>content</DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole("button", { name: "Close" })).toBeDefined();
  });

  it("renders a custom closeLabel", () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <DialogContent closeLabel="Kapat">content</DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole("button", { name: "Kapat" })).toBeDefined();
  });
});
