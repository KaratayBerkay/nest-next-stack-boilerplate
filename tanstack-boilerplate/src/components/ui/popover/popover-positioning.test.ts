import { describe, it, expect } from "vitest";
import { calculatePopoverPosition } from "@/lib/popover-positioning";

describe("calculatePopoverPosition", () => {
  const triggerRect = { top: 100, bottom: 150, left: 200, right: 400 };

  it("returns position below trigger when content fits below", () => {
    const result = calculatePopoverPosition({
      triggerRect,
      contentWidth: 180,
      contentHeight: 80,
      align: "start",
      sideOffset: 8,
      viewportWidth: 1024,
      viewportHeight: 768,
    });

    expect(result.left).toBe(200);
    expect(result.top).toBe(158);
  });

  it("clamps left within viewport bounds", () => {
    const triggerNearRight = { top: 100, bottom: 150, left: 800, right: 1000 };
    const result = calculatePopoverPosition({
      triggerRect: triggerNearRight,
      contentWidth: 300,
      contentHeight: 80,
      align: "start",
      sideOffset: 8,
      viewportWidth: 1024,
      viewportHeight: 768,
    });

    expect(result.left).toBe(716);
  });

  it("clamps left end alignment within viewport bounds", () => {
    const triggerAtRight = { top: 100, bottom: 150, left: 1000, right: 1020 };
    const result = calculatePopoverPosition({
      triggerRect: triggerAtRight,
      contentWidth: 200,
      contentHeight: 80,
      align: "end",
      sideOffset: 8,
      viewportWidth: 1024,
      viewportHeight: 768,
    });

    expect(result.left).toBe(816);
  });

  it("flips above when content taller than space below and space above is sufficient", () => {
    const triggerNearBottom = { top: 700, bottom: 750, left: 200, right: 400 };
    const result = calculatePopoverPosition({
      triggerRect: triggerNearBottom,
      contentWidth: 180,
      contentHeight: 100,
      align: "start",
      sideOffset: 8,
      viewportWidth: 1024,
      viewportHeight: 768,
    });

    expect(result.top).toBe(592);
  });

  it("does not flip when content fits below", () => {
    const triggerNearBottom = { top: 700, bottom: 750, left: 200, right: 400 };
    const result = calculatePopoverPosition({
      triggerRect: triggerNearBottom,
      contentWidth: 180,
      contentHeight: 10,
      align: "start",
      sideOffset: 8,
      viewportWidth: 1024,
      viewportHeight: 768,
    });

    expect(result.top).toBe(758);
  });

  it("uses end alignment for left calculation", () => {
    const result = calculatePopoverPosition({
      triggerRect,
      contentWidth: 180,
      contentHeight: 80,
      align: "end",
      sideOffset: 8,
      viewportWidth: 1024,
      viewportHeight: 768,
    });

    expect(result.left).toBe(220);
  });

  it("returns minimal left of 8 when trigger is off-screen left", () => {
    const triggerOffLeft = { top: 100, bottom: 150, left: -100, right: 50 };
    const result = calculatePopoverPosition({
      triggerRect: triggerOffLeft,
      contentWidth: 180,
      contentHeight: 80,
      align: "start",
      sideOffset: 8,
      viewportWidth: 1024,
      viewportHeight: 768,
    });

    expect(result.left).toBe(8);
  });
});
