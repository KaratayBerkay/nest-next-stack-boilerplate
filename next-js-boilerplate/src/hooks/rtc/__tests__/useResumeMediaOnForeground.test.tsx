import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Room } from "livekit-client";
import { useResumeMediaOnForeground } from "@/hooks/rtc/useResumeMediaOnForeground";

// Regression: mobile browsers pause every media element while the page is
// backgrounded and never resume it — remote video stayed black until a manual
// reload. The hook must replay media (startVideo/startAudio) and refresh the
// participant snapshot when the page returns to the foreground.

function makeRoom() {
  return {
    startVideo: vi.fn().mockResolvedValue(undefined),
    startAudio: vi.fn().mockResolvedValue(undefined),
  } as unknown as Room;
}

function fireVisible() {
  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
}

describe("useResumeMediaOnForeground", () => {
  beforeEach(() => {
    // jsdom defaults to "visible"; make it explicit so the guard is exercised.
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
  });

  it("replays media and calls onResume when the page becomes visible", () => {
    const room = makeRoom();
    const onResume = vi.fn();
    renderHook(() =>
      useResumeMediaOnForeground({ current: room }, true, onResume),
    );

    fireVisible();

    expect(room.startVideo).toHaveBeenCalledTimes(1);
    expect(room.startAudio).toHaveBeenCalledTimes(1);
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it("also resumes on pageshow (bfcache restore)", () => {
    const room = makeRoom();
    renderHook(() => useResumeMediaOnForeground({ current: room }, true));

    act(() => {
      window.dispatchEvent(new Event("pageshow"));
    });

    expect(room.startVideo).toHaveBeenCalledTimes(1);
  });

  it("does nothing while the page is hidden", () => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    const room = makeRoom();
    renderHook(() => useResumeMediaOnForeground({ current: room }, true));

    fireVisible();

    expect(room.startVideo).not.toHaveBeenCalled();
  });

  it("does nothing before the room is connected, and detaches on unmount", () => {
    const room = makeRoom();
    const { unmount } = renderHook(() =>
      useResumeMediaOnForeground({ current: room }, false),
    );
    fireVisible();
    expect(room.startVideo).not.toHaveBeenCalled();

    unmount();
    fireVisible();
    expect(room.startVideo).not.toHaveBeenCalled();
  });
});
