import { fireEvent, render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useScrollFadeX } from "./useScrollFadeX";

function Probe() {
  const ref = useScrollFadeX<HTMLDivElement>();
  return <div data-testid="scroller" ref={ref} className="overflow-x-auto" />;
}

function mockScrollMetrics(
  el: HTMLElement,
  { scrollWidth, clientWidth }: { scrollWidth: number; clientWidth: number },
) {
  Object.defineProperty(el, "scrollWidth", {
    configurable: true,
    get: () => scrollWidth,
  });
  Object.defineProperty(el, "clientWidth", {
    configurable: true,
    get: () => clientWidth,
  });
}

describe("useScrollFadeX", () => {
  it("adds no fade when the content does not overflow", () => {
    const { getByTestId } = render(<Probe />);
    const el = getByTestId("scroller");
    mockScrollMetrics(el, { scrollWidth: 200, clientWidth: 200 });
    fireEvent.scroll(el);
    expect(el.classList.contains("scroll-fade-x")).toBe(false);
  });

  it("fades only the scrollable edge and follows the scroll position", () => {
    const { getByTestId } = render(<Probe />);
    const el = getByTestId("scroller");
    mockScrollMetrics(el, { scrollWidth: 600, clientWidth: 200 });

    el.scrollLeft = 0;
    fireEvent.scroll(el);
    expect(el.classList.contains("scroll-fade-x")).toBe(true);
    expect(el.classList.contains("scrolled-to-left")).toBe(true);
    expect(el.classList.contains("scrolled-to-right")).toBe(false);

    el.scrollLeft = 200;
    fireEvent.scroll(el);
    expect(el.classList.contains("scrolled-to-left")).toBe(false);
    expect(el.classList.contains("scrolled-to-right")).toBe(false);

    el.scrollLeft = 400;
    fireEvent.scroll(el);
    expect(el.classList.contains("scrolled-to-right")).toBe(true);
  });
});
