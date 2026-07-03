import { describe, it, expect, vi } from "vitest";
import { render, screen, renderHook } from "@testing-library/react";
import { TierGate } from "@/components/TierGate";
import { useMinTier } from "@/hooks/useMinTier";

const mockAuth = vi.hoisted(() => ({
  user: null as { tier?: string } | null,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: mockAuth.user }),
}));

describe("TierGate", () => {
  it("renders children when the user meets the minimum tier", () => {
    mockAuth.user = { tier: "PREMIUM" };
    render(
      <TierGate min="BASIC" fallback={<p>locked</p>}>
        <p>secret</p>
      </TierGate>,
    );
    expect(screen.getByText("secret")).toBeTruthy();
    expect(screen.queryByText("locked")).toBeNull();
  });

  it("renders the fallback when the user is below the minimum tier", () => {
    mockAuth.user = { tier: "FREE" };
    render(
      <TierGate min="MEDIUM" fallback={<p>locked</p>}>
        <p>secret</p>
      </TierGate>,
    );
    expect(screen.getByText("locked")).toBeTruthy();
    expect(screen.queryByText("secret")).toBeNull();
  });

  it("renders the fallback when logged out", () => {
    mockAuth.user = null;
    render(
      <TierGate min="FREE" fallback={<p>locked</p>}>
        <p>secret</p>
      </TierGate>,
    );
    expect(screen.getByText("locked")).toBeTruthy();
  });

  it("renders nothing when below tier and no fallback is given", () => {
    mockAuth.user = { tier: "FREE" };
    const { container } = render(
      <TierGate min="PREMIUM">
        <p>secret</p>
      </TierGate>,
    );
    expect(container.innerHTML).toBe("");
  });
});

describe("useMinTier", () => {
  it("mirrors tierAtLeast against the authed user", () => {
    mockAuth.user = { tier: "MEDIUM" };
    expect(renderHook(() => useMinTier("BASIC")).result.current).toBe(true);
    expect(renderHook(() => useMinTier("PREMIUM")).result.current).toBe(false);

    mockAuth.user = null;
    expect(renderHook(() => useMinTier("FREE")).result.current).toBe(false);
  });
});
