export type RealtimeStatus =
  | "idle"
  | "connecting"
  | "authenticating"
  | "open"
  | "backoff"
  | "down"
  | "waiting";

import { AUTH_REFRESH_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";

const TOPIC_ALLOWLIST = /^(feed|post:[a-z0-9]+)$/;

export class RealtimeClient {
  private ws: WebSocket | null = null;
  private status: RealtimeStatus = "idle";
  private sendQueue: Record<string, unknown>[] = [];
  private topicWatches = new Set<string>();
  private registeredServices: string[] = [];
  private currentClaims: Map<
    string,
    { page: string | null; params?: Record<string, string> }
  > = new Map();
  private authFailRetries = 0;
  // Set when a connection attempt closes without ever opening — the WS
  // handshake now authenticates via cookies (see realtime.gateway.ts's
  // verifyClient), so a rejection is invisible to this client: onopen simply
  // never fires and onclose carries no reason, indistinguishable from a
  // network blip. Treating "never opened" as "cookies might be stale" and
  // rotating them once before the next attempt is the only signal available.
  private pendingRefresh = false;
  private static readonly MAX_AUTH_FAIL_RETRIES = 3;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private backoffTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;
  private hasConnectedBefore = false;
  private onlineHandler: (() => void) | null = null;
  private static readonly BACKOFF_BASE_MS = 1000;
  private static readonly BACKOFF_CAP_MS = 30_000;

  constructor(
    private readonly url: string,
    private readonly onStatusChange: (status: RealtimeStatus) => void,
    private readonly onFrame: (frame: Record<string, unknown>) => void,
    private readonly onAuthenticated?: () => void,
  ) {}

  connect(): void {
    if (this.destroyed) return;
    this.setStatus("connecting");

    const open = () => {
      if (this.destroyed) return;
      let didOpen = false;
      const ws = new WebSocket(this.url);
      this.ws = ws;

      ws.onopen = () => {
        if (this.destroyed) return;
        didOpen = true;
        this.setStatus("authenticating");
      };

      ws.onmessage = (e) => {
        if (this.destroyed) return;
        try {
          const data = JSON.parse(e.data) as Record<string, unknown>;
          if (data.type === "authenticated") {
            this.authFailRetries = 0;
            this.setStatus("open");
            this.flushQueue();
            this.replaySubscriptions();
            this.replayClaim();
            this.onAuthenticated?.();
            return;
          }
          this.onFrame(data);
        } catch {
          /* ignore malformed frames */
        }
      };

      ws.onclose = () => {
        if (this.destroyed) return;
        this.ws = null;
        if (!didOpen) this.pendingRefresh = true;
        this.handleDisconnect();
      };
    };

    if (this.pendingRefresh) {
      this.pendingRefresh = false;
      fetch(AUTH_REFRESH_URL, { method: POST })
        .catch(() => {
          /* a genuinely dead session fails the next handshake too — the
             existing backoff/retry ceiling bounds how long this repeats */
        })
        .finally(open);
    } else {
      open();
    }
  }

  disconnect(): void {
    this.destroyed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.backoffTimer) clearTimeout(this.backoffTimer);
    if (this.onlineHandler) {
      window.removeEventListener("online", this.onlineHandler);
      this.onlineHandler = null;
    }
    this.ws?.close();
    this.ws = null;
    this.sendQueue = [];
    this.setStatus("idle");
  }

  send(data: Record<string, unknown>): void {
    if (this.status === "open" && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      this.sendQueue.push(data);
    }
  }

  watch(topic: string): void {
    if (!TOPIC_ALLOWLIST.test(topic)) return;
    this.topicWatches.add(topic);
    this.send({ type: "watch", topic });
  }

  unwatch(topic: string): void {
    this.topicWatches.delete(topic);
    this.send({ type: "unwatch", topic });
  }

  registerServices(services: string[]): void {
    this.registeredServices = services;
    this.send({ type: "register", services });
  }

  claimPage(
    page: string | null,
    params?: Record<string, string>,
    tabId?: string,
  ): void {
    const id = tabId ?? "_default";
    this.currentClaims.set(id, { page, params });
    this.send({ type: "page", page, params, tabId: id });
  }

  unclaimPage(tabId: string): void {
    this.currentClaims.delete(tabId);
    this.send({ type: "page", page: null, tabId });
  }

  getStatus(): RealtimeStatus {
    return this.status;
  }

  // ---- Private ----

  private setStatus(s: RealtimeStatus): void {
    this.status = s;
    this.onStatusChange(s);
  }

  private flushQueue(): void {
    if (this.sendQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      for (const msg of this.sendQueue) {
        this.ws.send(JSON.stringify(msg));
      }
      this.sendQueue = [];
    }
  }

  private replaySubscriptions(): void {
    if (this.hasConnectedBefore && this.registeredServices.length > 0) {
      this.send({ type: "register", services: this.registeredServices });
    }
    this.hasConnectedBefore = true;
    for (const topic of this.topicWatches) {
      this.send({ type: "watch", topic });
    }
  }

  private replayClaim(): void {
    for (const [tabId, claim] of this.currentClaims) {
      this.send({
        type: "page",
        page: claim.page,
        params: claim.params,
        tabId,
      });
    }
  }

  private handleDisconnect(): void {
    if (this.authFailRetries < RealtimeClient.MAX_AUTH_FAIL_RETRIES) {
      this.authFailRetries++;
      this.startBackoff();
    } else {
      this.setStatus("down");
      this.scheduleDegradedRetry();
    }
  }

  private startBackoff(): void {
    const delay = Math.min(
      RealtimeClient.BACKOFF_BASE_MS *
        Math.pow(2, this.authFailRetries - 1) *
        (0.5 + Math.random() * 0.5),
      RealtimeClient.BACKOFF_CAP_MS,
    );
    this.setStatus("backoff");
    this.backoffTimer = setTimeout(() => this.connect(), delay);
  }

  private scheduleDegradedRetry(): void {
    const retry = () => {
      if (this.destroyed) return;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      if (this.onlineHandler) {
        window.removeEventListener("online", this.onlineHandler);
        this.onlineHandler = null;
      }
      this.authFailRetries = 0;
      this.connect();
    };
    this.onlineHandler = retry;
    window.addEventListener("online", retry, { once: true });
    this.reconnectTimer = setTimeout(retry, 60_000);
  }
}
