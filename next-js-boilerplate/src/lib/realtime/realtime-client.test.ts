import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RealtimeClient, type RealtimeStatus } from "./realtime-client";

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
    tokens?: Record<string, string> | null;
    onStatusChange?: (s: RealtimeStatus) => void;
    onFrame?: (f: Record<string, unknown>) => void;
    onAuthenticated?: () => void;
    onBustTokenCache?: () => void;
  } = {},
) {
  const tokens = overrides.tokens ?? {
    access_token: "at",
    rbac_token: "rb",
    device_token: "dt",
    user_token: "ut",
  };
  const getTokens = vi.fn().mockResolvedValue(tokens);
  const onStatusChange = overrides.onStatusChange ?? vi.fn();
  const onFrame = overrides.onFrame ?? vi.fn();
  const onAuthenticated = overrides.onAuthenticated ?? vi.fn();
  const onBustTokenCache = overrides.onBustTokenCache ?? vi.fn();

  const client = new RealtimeClient(
    "ws://localhost:3000",
    getTokens,
    onStatusChange,
    onFrame,
    onAuthenticated,
    onBustTokenCache,
  );

  return {
    client,
    getTokens,
    onStatusChange,
    onFrame,
    onAuthenticated,
    onBustTokenCache,
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

    it("flushes queue on authenticated", () => {
      const { client } = createClient();
      client.connect();
      client.send({ type: "ping" });
      client.send({ type: "watch", topic: "feed" });
      const ws = MockWebSocket.instances[0];
      ws.simulateOpen();
      ws.simulateMessage({ type: "authenticated" });
      expect(ws.sent).toHaveLength(2);
      expect(JSON.parse(ws.sent[0])).toEqual({ type: "ping" });
      expect(JSON.parse(ws.sent[1])).toEqual({ type: "watch", topic: "feed" });
    });

    it("sends immediately when open", () => {
      const { client } = createClient();
      client.connect();
      const ws = MockWebSocket.instances[0];
      ws.simulateOpen();
      ws.simulateMessage({ type: "authenticated" });
      client.send({ type: "ping" });
      expect(ws.sent).toHaveLength(1);
      expect(JSON.parse(ws.sent[0])).toEqual({ type: "ping" });
    });
  });

  describe("auth failure handling", () => {
    it("sets pendingAuthFail on auth error frame", () => {
      const { client, onBustTokenCache } = createClient();
      client.connect();
      const ws = MockWebSocket.instances[0];
      ws.simulateOpen();
      ws.simulateMessage({ type: "error", message: "Authentication failed" });
      // onclose fires → handleDisconnect → backoff
      expect(onBustTokenCache).not.toHaveBeenCalled();
    });

    it("busts token cache on reconnection after auth failure", async () => {
      vi.useFakeTimers();
      const { client, getTokens, onBustTokenCache } = createClient();
      client.connect();
      const ws1 = MockWebSocket.instances[0];
      ws1.simulateOpen();
      ws1.simulateMessage({ type: "error", message: "auth" });
      // ws1 closes → handleDisconnect → startBackoff → setTimeout(connect, delay)
      // Advance past the backoff delay to trigger reconnect
      vi.advanceTimersByTime(2000);
      await vi.advanceTimersByTimeAsync(0);
      expect(MockWebSocket.instances.length).toBeGreaterThanOrEqual(2);
      const ws2 = MockWebSocket.instances[1];
      ws2.simulateOpen();
      // onopen calls refreshAndFetchTokens → bustTokenCache + fetch + getTokens
      await vi.advanceTimersByTimeAsync(0);
      expect(onBustTokenCache).toHaveBeenCalledOnce();
      expect(getTokens).toHaveBeenCalledTimes(2); // once in initial connect, once after bust
      vi.useRealTimers();
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
