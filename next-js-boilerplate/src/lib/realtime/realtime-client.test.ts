import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RealtimeClient, type RealtimeStatus } from "./realtime-client";

// Message frames are encrypted at flush time by the crypto session; the unit
// under test here is the queue/control-frame logic, so stub the crypto module.
const sessionMocks = vi.hoisted(() => ({
  encryptForServer: vi.fn((data: unknown) => ({
    v: 2,
    nonce: "mock-nonce",
    ct: JSON.stringify(data),
  })),
  hasSession: vi.fn(() => true),
  performHandshake: vi.fn(async () => {}),
  decryptFromServer: vi.fn((frame: unknown) => frame),
  destroySession: vi.fn(() => {}),
  reKey: vi.fn(() => {}),
}));

vi.mock("@/lib/crypto/session", () => sessionMocks);

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  static nextId = 0;

  url: string;
  onopen: (() => void) | null = null;
  onmessage: ((e: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  readyState = 0; // CONNECTING
  sent: string[] = [];
  id: number;

  static OPEN = 1;

  constructor(url: string) {
    this.url = url;
    this.id = MockWebSocket.nextId++;
    MockWebSocket.instances.push(this);
  }

  send(data: string) {
    this.sent.push(data);
  }

  close() {
    this.readyState = 3; // CLOSED
    this.onclose?.();
  }

  // Test helper: simulate server sending a message
  simulateMessage(data: Record<string, unknown>) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }

  // Test helper: simulate connection opening
  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }

  static reset() {
    MockWebSocket.instances = [];
    MockWebSocket.nextId = 0;
  }
}

// Stub window.addEventListener/removeEventListener for degraded-retry tests
const eventListeners: Record<string, ((...args: unknown[]) => void)[]> = {};

beforeEach(() => {
  MockWebSocket.reset();
  sessionMocks.hasSession.mockReturnValue(true);
  sessionMocks.encryptForServer.mockClear();
  vi.stubGlobal("WebSocket", MockWebSocket);
  vi.stubGlobal("window", {
    addEventListener: vi.fn((event: string, handler: () => void) => {
      if (!eventListeners[event]) eventListeners[event] = [];
      eventListeners[event].push(handler);
    }),
    removeEventListener: vi.fn((event: string, handler: () => void) => {
      eventListeners[event] = (eventListeners[event] ?? []).filter(
        (h) => h !== handler,
      );
    }),
  });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
});

afterEach(() => {
  vi.restoreAllMocks();
  for (const key of Object.keys(eventListeners)) {
    delete eventListeners[key];
  }
});

function createClient(
  overrides: {
    onStatusChange?: (s: RealtimeStatus) => void;
    onFrame?: (f: Record<string, unknown>) => void;
    onAuthenticated?: () => void;
    onAuthExpired?: () => void;
  } = {},
) {
  const onStatusChange = overrides.onStatusChange ?? vi.fn();
  const onFrame = overrides.onFrame ?? vi.fn();
  const onAuthenticated = overrides.onAuthenticated ?? vi.fn();
  const onAuthExpired = overrides.onAuthExpired ?? vi.fn();

  const client = new RealtimeClient(
    "ws://localhost:3000",
    onStatusChange,
    onFrame,
    onAuthenticated,
    onAuthExpired,
  );

  return {
    client,
    onStatusChange,
    onFrame,
    onAuthenticated,
    onAuthExpired,
  };
}

describe("RealtimeClient", () => {
  describe("connection lifecycle", () => {
    it("starts in idle status", () => {
      const { client } = createClient();
      expect(client.getStatus()).toBe("idle");
    });

    it("transitions to connecting on connect()", () => {
      const { client, onStatusChange } = createClient();
      client.connect();
      expect(onStatusChange).toHaveBeenCalledWith("connecting");
    });

    it("transitions to authenticating when WebSocket opens", () => {
      const { client, onStatusChange } = createClient();
      client.connect();
      const ws = MockWebSocket.instances[0];
      ws.simulateOpen();
      expect(onStatusChange).toHaveBeenCalledWith("authenticating");
    });

    it("transitions to open on authenticated frame", () => {
      const { client, onStatusChange } = createClient();
      client.connect();
      const ws = MockWebSocket.instances[0];
      ws.simulateOpen();
      ws.simulateMessage({ type: "authenticated" });
      expect(onStatusChange).toHaveBeenCalledWith("open");
    });

    it("calls onAuthenticated callback", () => {
      const { client, onAuthenticated } = createClient();
      client.connect();
      const ws = MockWebSocket.instances[0];
      ws.simulateOpen();
      ws.simulateMessage({ type: "authenticated" });
      expect(onAuthenticated).toHaveBeenCalledOnce();
    });

    it("forwards non-auth frames to onFrame", () => {
      const { client, onFrame } = createClient();
      client.connect();
      const ws = MockWebSocket.instances[0];
      ws.simulateOpen();
      ws.simulateMessage({ type: "authenticated" });
      ws.simulateMessage({ type: "event", data: "hello" });
      expect(onFrame).toHaveBeenCalledWith({ type: "event", data: "hello" });
    });
  });

  describe("send queue", () => {
    it("queues messages while not open", () => {
      const { client } = createClient();
      client.connect();
      client.send({ type: "ping" });
      const ws = MockWebSocket.instances[0];
      expect(ws.sent).toHaveLength(0);
    });

    it("flushes queue on authenticated: messages encrypted, control frames plaintext", () => {
      const { client } = createClient();
      client.connect();
      client.send({ type: "ping", text: "hi" });
      client.send({ type: "watch", topic: "feed" });
      const ws = MockWebSocket.instances[0];
      ws.simulateOpen();
      ws.simulateMessage({ type: "authenticated" });
      expect(ws.sent).toHaveLength(2);
      expect(sessionMocks.encryptForServer).toHaveBeenCalledWith({
        type: "ping",
        text: "hi",
      });
      expect(JSON.parse(ws.sent[0])).toEqual({
        v: 2,
        nonce: "mock-nonce",
        ct: JSON.stringify({ type: "ping", text: "hi" }),
      });
      expect(JSON.parse(ws.sent[1])).toEqual({ type: "watch", topic: "feed" });
    });

    it("holds message frames queued while the crypto session is unavailable (never plaintext)", () => {
      sessionMocks.hasSession.mockReturnValue(false);
      const { client } = createClient();
      client.connect();
      client.send({ type: "ping", text: "hi" });
      const ws = MockWebSocket.instances[0];
      ws.simulateOpen();
      ws.simulateMessage({ type: "authenticated" });
      expect(ws.sent).toHaveLength(0);
      expect(sessionMocks.encryptForServer).not.toHaveBeenCalled();
    });

    it("sends immediately when open (message frames go through encryption)", () => {
      const { client } = createClient();
      client.connect();
      const ws = MockWebSocket.instances[0];
      ws.simulateOpen();
      ws.simulateMessage({ type: "authenticated" });
      client.send({ type: "ping" });
      expect(ws.sent).toHaveLength(1);
      expect(sessionMocks.encryptForServer).toHaveBeenCalledWith({
        type: "ping",
      });
      expect(JSON.parse(ws.sent[0])).toEqual({
        v: 2,
        nonce: "mock-nonce",
        ct: JSON.stringify({ type: "ping" }),
      });
    });

    it("sends control frames plaintext even when the crypto session is unavailable", () => {
      sessionMocks.hasSession.mockReturnValue(false);
      const { client } = createClient();
      client.connect();
      client.send({ type: "watch", topic: "feed" });
      const ws = MockWebSocket.instances[0];
      ws.simulateOpen();
      ws.simulateMessage({ type: "authenticated" });
      expect(ws.sent).toHaveLength(1);
      expect(JSON.parse(ws.sent[0])).toEqual({ type: "watch", topic: "feed" });
    });
  });

  describe("auth failure handling", () => {
    // The WS handshake now authenticates via cookies at connect time (see
    // realtime.gateway.ts's verifyClient) — a rejection is invisible to this
    // client (onopen never fires, onclose carries no reason), so "never
    // opened" is the only signal available that cookies might be stale.
    it("calls /api/auth/refresh before retrying a connection that never opened", async () => {
      vi.useFakeTimers();
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal("fetch", fetchMock);
      const { client } = createClient();
      client.connect();
      const ws1 = MockWebSocket.instances[0];
      ws1.close(); // rejected before ever opening
      vi.advanceTimersByTime(2000);
      await vi.advanceTimersByTimeAsync(0);
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/auth/refresh",
        expect.objectContaining({ method: "POST" }),
      );
      expect(MockWebSocket.instances.length).toBeGreaterThanOrEqual(2);
      vi.useRealTimers();
    });

    it("does not call /api/auth/refresh before retrying a connection that previously opened", async () => {
      vi.useFakeTimers();
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal("fetch", fetchMock);
      const { client } = createClient();
      client.connect();
      const ws1 = MockWebSocket.instances[0];
      ws1.simulateOpen();
      ws1.simulateMessage({ type: "authenticated" });
      ws1.close(); // a normal disconnect after a successful open
      vi.advanceTimersByTime(2000);
      await vi.advanceTimersByTimeAsync(0);
      expect(fetchMock).not.toHaveBeenCalled();
      expect(MockWebSocket.instances.length).toBeGreaterThanOrEqual(2);
      vi.useRealTimers();
    });

    it("hard-logs out and stops retrying when the pre-connect refresh 401s", async () => {
      vi.useFakeTimers();
      const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 401 });
      vi.stubGlobal("fetch", fetchMock);
      const onAuthExpired = vi.fn();
      const { client, onStatusChange } = createClient({ onAuthExpired });
      client.connect();
      const ws1 = MockWebSocket.instances[0];
      ws1.close(); // rejected before ever opening → pendingRefresh
      vi.advanceTimersByTime(2000);
      await vi.advanceTimersByTimeAsync(0);
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/auth/refresh",
        expect.objectContaining({ method: "POST" }),
      );
      expect(onAuthExpired).toHaveBeenCalledTimes(1);
      // No new socket is opened after an auth-expired stop.
      expect(MockWebSocket.instances.length).toBe(1);
      expect(onStatusChange).toHaveBeenCalledWith("idle");
      // The 60s degraded timer must not re-connect either.
      vi.advanceTimersByTime(60_000);
      await vi.advanceTimersByTimeAsync(0);
      expect(MockWebSocket.instances.length).toBe(1);
      vi.useRealTimers();
    });

    it("reopens the socket (does not hard-log-out) when the pre-connect refresh fails with a non-auth status", async () => {
      vi.useFakeTimers();
      // e.g. CSRF handshake failure or the backend being briefly unreachable
      // mid-deploy — the BFF returns 500, not 401. Not proof the session is
      // dead, so this must retry, not log the user out and wipe their keys.
      const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 });
      vi.stubGlobal("fetch", fetchMock);
      const onAuthExpired = vi.fn();
      const { client } = createClient({ onAuthExpired });
      client.connect();
      const ws1 = MockWebSocket.instances[0];
      ws1.close(); // rejected before ever opening → pendingRefresh
      vi.advanceTimersByTime(2000);
      await vi.advanceTimersByTimeAsync(0);
      expect(onAuthExpired).not.toHaveBeenCalled();
      expect(MockWebSocket.instances.length).toBeGreaterThanOrEqual(2);
      vi.useRealTimers();
    });

    it("reopens the socket when the pre-connect refresh fails on a network error", async () => {
      vi.useFakeTimers();
      const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
      vi.stubGlobal("fetch", fetchMock);
      const onAuthExpired = vi.fn();
      const { client } = createClient({ onAuthExpired });
      client.connect();
      const ws1 = MockWebSocket.instances[0];
      ws1.close(); // never opened
      vi.advanceTimersByTime(2000);
      await vi.advanceTimersByTimeAsync(0);
      expect(onAuthExpired).not.toHaveBeenCalled();
      expect(MockWebSocket.instances.length).toBeGreaterThanOrEqual(2);
      vi.useRealTimers();
    });

    it("never sends a client-side auth message", () => {
      const { client } = createClient();
      client.connect();
      const ws = MockWebSocket.instances[0];
      ws.simulateOpen();
      ws.simulateMessage({ type: "authenticated" });
      expect(ws.sent.every((s) => JSON.parse(s).type !== "auth")).toBe(true);
    });

    it("resets auth fail retries on successful authentication", () => {
      const { client, onStatusChange } = createClient();
      client.connect();
      const ws = MockWebSocket.instances[0];
      ws.simulateOpen();
      ws.simulateMessage({ type: "authenticated" });
      expect(onStatusChange).toHaveBeenCalledWith("open");
    });
  });

  describe("topic allowlist", () => {
    it("allows 'feed' topic", () => {
      const { client } = createClient();
      client.connect();
      client.watch("feed");
      const ws = MockWebSocket.instances[0];
      ws.simulateOpen();
      ws.simulateMessage({ type: "authenticated" });
      expect(ws.sent.some((s) => JSON.parse(s).topic === "feed")).toBe(true);
    });

    it("allows 'post:abc123' topic", () => {
      const { client } = createClient();
      client.connect();
      client.watch("post:abc123");
      const ws = MockWebSocket.instances[0];
      ws.simulateOpen();
      ws.simulateMessage({ type: "authenticated" });
      expect(ws.sent.some((s) => JSON.parse(s).topic === "post:abc123")).toBe(
        true,
      );
    });

    it("rejects topics not matching allowlist", () => {
      const { client } = createClient();
      client.connect();
      client.watch("admin:secrets");
      const ws = MockWebSocket.instances[0];
      ws.simulateOpen();
      ws.simulateMessage({ type: "authenticated" });
      expect(ws.sent.some((s) => JSON.parse(s).topic === "admin:secrets")).toBe(
        false,
      );
    });
  });

  describe("claim and register", () => {
    it("sends page claim", () => {
      const { client } = createClient();
      client.connect();
      client.claimPage("feed", { tab: "latest" });
      const ws = MockWebSocket.instances[0];
      ws.simulateOpen();
      ws.simulateMessage({ type: "authenticated" });
      const claimFrame = ws.sent.find((s) => JSON.parse(s).type === "page");
      expect(claimFrame).toBeDefined();
      expect(JSON.parse(claimFrame!)).toEqual({
        type: "page",
        page: "feed",
        params: { tab: "latest" },
        tabId: "_default",
      });
    });

    it("replays claim after reconnect", async () => {
      vi.useFakeTimers();
      const { client } = createClient();
      client.connect();
      client.claimPage("feed", { tab: "latest" });
      const ws1 = MockWebSocket.instances[0];
      ws1.simulateOpen();
      ws1.simulateMessage({ type: "authenticated" });
      // Simulate disconnect → backoff → reconnect
      ws1.close();
      vi.advanceTimersByTime(2000);
      await vi.advanceTimersByTimeAsync(0);
      expect(MockWebSocket.instances.length).toBeGreaterThanOrEqual(2);
      const ws2 = MockWebSocket.instances[1];
      ws2.simulateOpen();
      ws2.simulateMessage({ type: "authenticated" });
      const claimFrame = ws2.sent.find((s) => JSON.parse(s).type === "page");
      expect(claimFrame).toBeDefined();
      expect(JSON.parse(claimFrame!)).toEqual({
        type: "page",
        page: "feed",
        params: { tab: "latest" },
        tabId: "_default",
      });
      vi.useRealTimers();
    });

    it("sends register services", () => {
      const { client } = createClient();
      client.connect();
      client.registerServices(["notifications", "chat"]);
      const ws = MockWebSocket.instances[0];
      ws.simulateOpen();
      ws.simulateMessage({ type: "authenticated" });
      expect(
        ws.sent.some(
          (s) =>
            JSON.parse(s).type === "register" &&
            JSON.parse(s).services.includes("notifications"),
        ),
      ).toBe(true);
    });

    it("does not duplicate register on first connect", () => {
      const { client } = createClient();
      client.connect();
      client.registerServices(["notifications", "chat"]);
      const ws = MockWebSocket.instances[0];
      ws.simulateOpen();
      ws.simulateMessage({ type: "authenticated" });
      const registers = ws.sent.filter(
        (s) => JSON.parse(s).type === "register",
      );
      expect(registers).toHaveLength(1);
    });
  });

  describe("disconnect", () => {
    it("sets status to idle on disconnect", () => {
      const { client, onStatusChange } = createClient();
      client.connect();
      client.disconnect();
      expect(onStatusChange).toHaveBeenCalledWith("idle");
      expect(client.getStatus()).toBe("idle");
    });

    it("does not reconnect after disconnect", () => {
      const { client } = createClient();
      client.connect();
      client.disconnect();
      expect(MockWebSocket.instances).toHaveLength(1);
    });

    it("prevents connect after destroy", () => {
      const { client } = createClient();
      client.connect();
      client.disconnect();
      client.connect();
      expect(MockWebSocket.instances).toHaveLength(1);
    });
  });

  describe("degraded retry", () => {
    it("schedules degraded retry after max auth fail retries", () => {
      const { client } = createClient();
      client.connect();
      const ws = MockWebSocket.instances[0];
      ws.simulateOpen();
      // Simulate 4 disconnects (max is 3 auth fail retries)
      for (let i = 0; i < 4; i++) {
        ws.close();
      }
      expect(client.getStatus()).toBe("down");
    });

    it("retries on window online event in degraded mode", () => {
      const { client } = createClient();
      client.connect();
      const ws = MockWebSocket.instances[0];
      ws.simulateOpen();
      // Exhaust all retries
      for (let i = 0; i < 4; i++) {
        ws.close();
      }
      expect(client.getStatus()).toBe("down");
      // Simulate online event
      const handler = eventListeners["online"]?.[0];
      handler?.();
      expect(MockWebSocket.instances.length).toBeGreaterThan(1);
    });
  });
});
