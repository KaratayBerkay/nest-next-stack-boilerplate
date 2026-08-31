import { fireEvent, render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import en from "@/generated/i18n-messages-en.json";
import { WithFormAnimatedTestimonials } from "../WithFormAnimatedTestimonials";

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => (en as Record<string, unknown>).pages,
}));
vi.mock("@/hooks/useComponentVariant", () => ({
  useComponentVariant: (variant?: string) => variant ?? "default",
}));

const bookADemo = (
  (en as Record<string, unknown>).pages as {
    bookADemo: Record<string, string>;
  }
).bookADemo;

const QUOTE_1 = bookADemo.bookADemo2Testimonial1Quote;
const QUOTE_2 = bookADemo.bookADemo2Testimonial2Quote;
const ROTATION_INTERVAL_MS = 5000;

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query === "(prefers-reduced-motion: reduce)" ? matches : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("WithFormAnimatedTestimonials auto-advance", () => {
  it("rotates to the next testimonial on the interval", () => {
    vi.useFakeTimers();
    render(<WithFormAnimatedTestimonials />);
    expect(screen.getByText(QUOTE_1, { exact: false })).toBeTruthy();
    act(() => vi.advanceTimersByTime(ROTATION_INTERVAL_MS + 50));
    expect(screen.getByText(QUOTE_2, { exact: false })).toBeTruthy();
  });

  it("pauses while hovered", () => {
    vi.useFakeTimers();
    const { container } = render(<WithFormAnimatedTestimonials />);
    const section = container.querySelector("section");
    expect(section).toBeTruthy();
    fireEvent.mouseEnter(section as Element);
    act(() => vi.advanceTimersByTime(ROTATION_INTERVAL_MS * 2));
    expect(screen.getByText(QUOTE_1, { exact: false })).toBeTruthy();
  });

  it("does not auto-advance under prefers-reduced-motion", () => {
    stubReducedMotion(true);
    vi.useFakeTimers();
    render(<WithFormAnimatedTestimonials />);
    act(() => vi.advanceTimersByTime(ROTATION_INTERVAL_MS * 2));
    expect(screen.getByText(QUOTE_1, { exact: false })).toBeTruthy();
    expect(screen.queryByText(QUOTE_2, { exact: false })).toBeNull();
  });
});
