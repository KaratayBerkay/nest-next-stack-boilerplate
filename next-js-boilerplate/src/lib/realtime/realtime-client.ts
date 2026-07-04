export type RealtimeStatus =
  | "idle"
  | "connecting"
  | "authenticating"
  | "open"
  | "backoff"
  | "down";

const TOPIC_ALLOWLIST = /^(feed|post:[a-z0-9]+)$/;

export class RealtimeClient {
  private ws: WebSocket | null = null;
  private status: RealtimeStatus = "idle";
  private sendQueue: Record<string, unknown>[] = [];
  private topicWatches = new Set<string>();
  private registeredServices: string[] = [];
  private currentClaim: { page: string | null; params?: Record<string, string> } | null = null;
  private authFailRetries = 0;
  private pendingAuthFail = false;
  private static readonly MAX_AUTH_FAIL_RETRIES = 3;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private backoffTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;
  private onlineHandler: (() => void) | null = null;
  private static readonly BACKOFF_BASE_MS = 1000;
  private static readonly BACKOFF_CAP_MS = 30_000;

  constructor(
    private readonly url: string,
    private readonly getTokens: () => Promise<Record<string, string> | null>,
    private readonly onStatusChange: (status: RealtimeStatus) => void,
    private readonly onFrame: (frame: Record<string, unknown>) => void,
    private readonly onAuthenticated?: () => void,
  ) {}

  connect(): void {
    if (this.destroyed) return;
    this.setStatus("connecting");
    const ws = new WebSocket(this.url);
    this.ws = ws;

    ws.onopen = async () => {
      if (this.destroyed) return;
      this.setStatus("authenticating");

      // If we're retrying after an auth failure, bust the token cache first
      let tokens: Record<string, string> | null = null;
      if (this.pendingAuthFail) {
        this.pendingAuthFail = false;
        tokens = await this.refreshAndFetchTokens();
      } else {
        tokens = await this.getTokens();
      }

      if (!tokens || this.destroyed) {
        ws.close();
        return;
      }
      ws.send(JSON.stringify({ type: "auth", tokens }));
    };

    ws.onmessage = (e) => {
      if (this.destroyed) return;
      try {
        const data = JSON.parse(e.data) as Record<string, unknown>;
        if (data.type === "error" && /auth/i.test(String(data.message ?? ""))) {
          this.pendingAuthFail = true;
          ws.close();
          return;
        }
        if (data.type === "authenticated") {
          this.authFailRetries = 0;
          this.pendingAuthFail = false;
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
      if (!this.destroyed) this.handleDisconnect();
    };
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

  claimPage(page: string | null, params?: Record<string, string>): void {
    this.currentClaim = { page, params };
    this.send({ type: "page", page, params });
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
    if (this.registeredServices.length > 0) {
      this.send({ type: "register", services: this.registeredServices });
    }
    for (const topic of this.topicWatches) {
      this.send({ type: "watch", topic });
    }
  }

  private replayClaim(): void {
    if (this.currentClaim) {
      this.send({
        type: "page",
        page: this.currentClaim.page,
        params: this.currentClaim.params,
      });
    }
  }

  private async refreshAndFetchTokens(): Promise<Record<string, string> | null> {
    try {
      // Bust the token cache by forcing a refresh
      const res = await fetch("/api/auth/token");
      if (!res.ok) return null;
    } catch {
      // Refresh failed — try with existing tokens
    }
    return this.getTokens();
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
