import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DropdownMenuItem } from "./dropdown-menu-item";

const closeAndFocusTrigger = vi.fn();

vi.mock("./dropdown-menu", () => ({
  useDropdownMenuContext: () => ({
    closeAndFocusTrigger,
    open: true,
    setOpen: vi.fn(),
    triggerRef: { current: null },
  }),
}));

describe("DropdownMenuItem", () => {
  beforeEach(() => {
    closeAndFocusTrigger.mockClear();
  });

  it("calls consumer onClick and closes menu on click", () => {
    const onClick = vi.fn();
    render(<DropdownMenuItem onClick={onClick}>Item</DropdownMenuItem>);
    fireEvent.click(screen.getByText("Item"));
    expect(onClick).toHaveBeenCalledOnce();
    expect(closeAndFocusTrigger).toHaveBeenCalledOnce();
  });

  it("does not call closeAndFocusTrigger when disabled", () => {
    const onClick = vi.fn();
    render(
      <DropdownMenuItem disabled onClick={onClick}>
        Item
      </DropdownMenuItem>,
    );
    fireEvent.click(screen.getByText("Item"));
    expect(onClick).not.toHaveBeenCalled();
    expect(closeAndFocusTrigger).not.toHaveBeenCalled();
  });

  it("closes menu and fires onClick via .click() on Enter key", () => {
    const onClick = vi.fn();
    render(<DropdownMenuItem onClick={onClick}>Item</DropdownMenuItem>);
    const item = screen.getByText("Item");
    fireEvent.keyDown(item, { key: "Enter" });
    expect(onClick).toHaveBeenCalledOnce();
    expect(closeAndFocusTrigger).toHaveBeenCalled();
  });

  it("closes menu and fires onClick via .click() on Space key", () => {
    const onClick = vi.fn();
    render(<DropdownMenuItem onClick={onClick}>Item</DropdownMenuItem>);
    const item = screen.getByText("Item");
    fireEvent.keyDown(item, { key: " " });
    expect(onClick).toHaveBeenCalledOnce();
    expect(closeAndFocusTrigger).toHaveBeenCalled();
  });

  it("does not close when disabled and Enter pressed", () => {
    const onClick = vi.fn();
    render(
      <DropdownMenuItem disabled onClick={onClick}>
        Item
      </DropdownMenuItem>,
    );
    const item = screen.getByText("Item");
    fireEvent.keyDown(item, { key: "Enter" });
    expect(closeAndFocusTrigger).not.toHaveBeenCalled();
  });
});
