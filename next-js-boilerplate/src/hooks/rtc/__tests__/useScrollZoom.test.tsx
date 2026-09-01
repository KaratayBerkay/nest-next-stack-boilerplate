import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PointerEvent, RefObject } from "react";
import { useScrollZoom } from "../useScrollZoom";

// A plain mutable container satisfies RefObject's shape — the hook only
// ever reads/writes `.current`, so a real useRef() isn't needed to drive it
// from a test.
function fakeRef<T>(current: T | null = null): RefObject<T | null> {
  return { current };
}

describe("useScrollZoom", () => {
  it("starts at 1x and clamps zoomIn/zoomOut to [1, 1.75] in 0.25 steps", () => {
    const { result } = renderHook(() =>
      useScrollZoom(fakeRef<HTMLDivElement>()),
    );

    expect(result.current.zoom).toBe(1);
    expect(result.current.canZoomOut).toBe(false);
    expect(result.current.canZoomIn).toBe(true);

    act(() => result.current.zoomOut()); // already at the floor — no-op
    expect(result.current.zoom).toBe(1);

    for (let i = 0; i < 9; i++) act(() => result.current.zoomIn());
    expect(result.current.zoom).toBe(1.75);
    expect(result.current.canZoomIn).toBe(false);

    act(() => result.current.zoomOut());
    expect(result.current.zoom).toBe(1.5);

    act(() => result.current.resetZoom());
    expect(result.current.zoom).toBe(1);
    expect(result.current.canZoomOut).toBe(false);
  });

  it("resets to 1x whenever resetKey changes — a new share session starts unzoomed", () => {
    const ref = fakeRef<HTMLDivElement>();
    const { result, rerender } = renderHook(
      ({ trackKey }) => useScrollZoom(ref, trackKey),
      { initialProps: { trackKey: "track-1" } },
    );

    act(() => result.current.zoomIn());
    act(() => result.current.zoomIn());
    expect(result.current.zoom).toBe(1.5);

    rerender({ trackKey: "track-2" });
    expect(result.current.zoom).toBe(1);
  });

  // Regression guard for the "always snaps to the top-left corner" bug a
  // naive zoom implementation would have: whatever content point was
  // centered in view (not necessarily the container's own top-left) must
  // stay centered as the zoom level changes.
  it("keeps the previously-centered content point stable when zooming, instead of always re-centering on the box", () => {
    // A detached element, not rendered by React — the hook only reads/
    // writes plain DOM properties on whatever the ref points to, so
    // there's no need to mount real JSX around it. scrollWidth/
    // scrollHeight are getters keyed off the hook's own current zoom so
    // this behaves like a real element whose content box grows with the
    // zoom-driven inline style — jsdom does no real layout, so nothing
    // does that automatically.
    const zoomBox = { current: 1 };
    const el = document.createElement("div");
    Object.defineProperty(el, "clientWidth", { value: 100 });
    Object.defineProperty(el, "clientHeight", { value: 100 });
    Object.defineProperty(el, "scrollWidth", {
      get: () => 100 * zoomBox.current,
    });
    Object.defineProperty(el, "scrollHeight", {
      get: () => 100 * zoomBox.current,
    });
    const ref = fakeRef<HTMLDivElement>(el);

    // A plain object the renderHook callback updates on every render — NOT
    // `result.current` (whether that reflects the latest render yet, at
    // the exact moment an effect from THIS SAME commit runs, is an
    // implementation detail of testing-library's own bookkeeping this test
    // shouldn't depend on).
    const { result } = renderHook(() => {
      const api = useScrollZoom(ref);
      zoomBox.current = api.zoom;
      return api;
    });

    // 1x -> 1.25x: no prior scroll, so the ratio math locks onto the
    // container's own center — box grows to 125, viewport stays 100, so
    // centering math puts scrollLeft at (125-100)/2 = 12.5.
    act(() => result.current.zoomIn());
    expect(el.scrollLeft).toBeCloseTo(12.5);

    // Scroll to the far-left edge — the user is now looking at content
    // near x=0 of the (at this point) 125-wide box, not the center.
    el.scrollLeft = 0;

    // 1.25x -> 1.5x: that same content point (ratio 0.4 of the 125-wide
    // box) must stay in view — a naive "always re-center" implementation
    // would instead jump to (150-100)/2 = 25.
    act(() => result.current.zoomIn());
    expect(el.scrollLeft).toBeCloseTo(10);
  });
});

function fakePointerEvent(
  overrides: Partial<{
    pointerId: number;
    clientX: number;
    clientY: number;
    pointerType: string;
    button: number;
  }> = {},
): PointerEvent<HTMLDivElement> {
  return {
    pointerId: 1,
    clientX: 0,
    clientY: 0,
    pointerType: "mouse",
    button: 0,
    ...overrides,
  } as unknown as PointerEvent<HTMLDivElement>;
}

describe("useScrollZoom drag-to-pan", () => {
  it("is not pannable at 1x, and becomes pannable once zoomed in", () => {
    const ref = fakeRef<HTMLDivElement>(document.createElement("div"));
    const { result } = renderHook(() => useScrollZoom(ref));

    expect(result.current.isPannable).toBe(false);

    act(() => result.current.zoomIn());
    expect(result.current.isPannable).toBe(true);
  });

  it("drags the scroll position opposite the pointer movement, and ends the drag on pointer up", () => {
    const el = document.createElement("div");
    const ref = fakeRef<HTMLDivElement>(el);
    const { result } = renderHook(() => useScrollZoom(ref));
    act(() => result.current.zoomIn());
    el.scrollLeft = 20;
    el.scrollTop = 10;

    act(() =>
      result.current.panHandlers.onPointerDown(
        fakePointerEvent({ clientX: 100, clientY: 50 }),
      ),
    );
    expect(result.current.isPanning).toBe(true);

    // Pointer moved 30px left, 10px down — the content follows the
    // pointer ("grab the paper and move it"), so the view scrolls the
    // opposite way: right (scrollLeft up) and up (scrollTop down).
    act(() =>
      result.current.panHandlers.onPointerMove(
        fakePointerEvent({ clientX: 70, clientY: 60 }),
      ),
    );
    expect(el.scrollLeft).toBe(50);
    expect(el.scrollTop).toBe(0);

    act(() =>
      result.current.panHandlers.onPointerUp(
        fakePointerEvent({ clientX: 70, clientY: 60 }),
      ),
    );
    expect(result.current.isPanning).toBe(false);
  });

  it("does nothing at 1x — there's nothing to pan yet", () => {
    const el = document.createElement("div");
    const ref = fakeRef<HTMLDivElement>(el);
    const { result } = renderHook(() => useScrollZoom(ref));

    act(() => result.current.panHandlers.onPointerDown(fakePointerEvent()));
    expect(result.current.isPanning).toBe(false);
  });

  it("ignores a right-click drag start — only a left-button mouse drag pans", () => {
    const el = document.createElement("div");
    const ref = fakeRef<HTMLDivElement>(el);
    const { result } = renderHook(() => useScrollZoom(ref));
    act(() => result.current.zoomIn());

    act(() =>
      result.current.panHandlers.onPointerDown(fakePointerEvent({ button: 2 })),
    );
    expect(result.current.isPanning).toBe(false);
  });
});
