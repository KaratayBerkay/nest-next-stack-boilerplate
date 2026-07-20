import { WebSocket } from 'ws';
import type { AuthWs } from './realtime.types';

interface PageAllowlistEntry {
  allowed: string[];
  key: string[];
}

const TOPIC_ALLOWLIST = /^(feed|post:[a-z0-9]+)$/;

const PAGE_ALLOWLIST: Record<string, PageAllowlistEntry> = {
  messages: { allowed: ['peer'], key: [] },
  'friend-request': { allowed: [], key: [] },
  notification: { allowed: [], key: [] },
  feed: { allowed: [], key: [] },
  post: { allowed: ['id'], key: ['id'] },
  'chat-room': { allowed: ['room'], key: ['room'] },
};

export class RealtimePageManager {
  readonly topicWatchers = new Map<string, Set<AuthWs>>();
  readonly pageClaims = new Map<string, Set<AuthWs>>();
  readonly pageJoinCallbacks = new Map<
    string,
    (ws: WebSocket, params: Record<string, string>) => void
  >();
  readonly pageLeaveCallbacks = new Map<
    string,
    (ws: WebSocket, params: Record<string, string>) => void
  >();

  addToTopicWatch(ws: AuthWs, topic: string): void {
    if (!this.topicWatchers.has(topic))
      this.topicWatchers.set(topic, new Set());
    this.topicWatchers.get(topic)!.add(ws);
    if (!ws.watchedTopics) ws.watchedTopics = [];
    if (!ws.watchedTopics.includes(topic)) ws.watchedTopics.push(topic);
  }

  removeFromTopicWatch(ws: AuthWs, topic: string): void {
    const watchers = this.topicWatchers.get(topic);
    if (watchers) {
      watchers.delete(ws);
      if (watchers.size === 0) this.topicWatchers.delete(topic);
    }
    if (ws.watchedTopics) {
      ws.watchedTopics = ws.watchedTopics.filter((t) => t !== topic);
    }
  }

  cleanupTopicWatches(ws: AuthWs): void {
    const topics = ws.watchedTopics;
    if (!topics) return;
    for (const topic of topics) {
      const watchers = this.topicWatchers.get(topic);
      if (watchers) {
        watchers.delete(ws);
        if (watchers.size === 0) this.topicWatchers.delete(topic);
      }
    }
  }

  handleWatch(ws: AuthWs, data: { topic: string }): string | null {
    if (!ws.userId) return null;
    if (!TOPIC_ALLOWLIST.test(data.topic)) return 'Invalid topic pattern';
    if (!this.topicWatchers.has(data.topic))
      this.topicWatchers.set(data.topic, new Set());
    this.topicWatchers.get(data.topic)!.add(ws);
    if (!ws.watchedTopics) ws.watchedTopics = [];
    if (!ws.watchedTopics.includes(data.topic))
      ws.watchedTopics.push(data.topic);
    return null;
  }

  handleUnwatch(ws: AuthWs, data: { topic: string }): void {
    if (!ws.userId) return;
    const watchers = this.topicWatchers.get(data.topic);
    if (watchers) {
      watchers.delete(ws);
      if (watchers.size === 0) this.topicWatchers.delete(data.topic);
    }
    if (ws.watchedTopics) {
      ws.watchedTopics = ws.watchedTopics.filter((t) => t !== data.topic);
    }
  }

  // ==================== Page-claim system ====================

  registerPageCallbacks(
    page: string,
    onJoin: (ws: WebSocket, params: Record<string, string>) => void,
    onLeave: (ws: WebSocket, params: Record<string, string>) => void,
  ): void {
    this.pageJoinCallbacks.set(page, onJoin);
    this.pageLeaveCallbacks.set(page, onLeave);
  }

  handlePage(
    ws: AuthWs,
    data: {
      page: string | null;
      params?: Record<string, string>;
      tabId?: string;
    },
  ): string | null {
    if (!ws.userId) return null;
    if (!ws.tabClaims) ws.tabClaims = new Map();

    const tabId = data.tabId ?? '_default';
    const newPage = data.page;
    const newParams = data.params;

    if (newPage !== null) {
      const entry = PAGE_ALLOWLIST[newPage];
      if (!entry) return `Invalid page "${newPage}"`;
      const paramKeys = newParams ? Object.keys(newParams) : [];
      for (const key of paramKeys) {
        if (!entry.allowed.includes(key))
          return `Invalid param "${key}" for page "${newPage}"`;
      }
      for (const required of entry.key) {
        if (!paramKeys.includes(required))
          return `Missing required param "${required}" for page "${newPage}"`;
      }
    }

    // Get the previous claim for this tab (if any)
    const prevClaim = ws.tabClaims.get(tabId);
    const prevPage = prevClaim?.page ?? null;
    const prevParams = prevClaim?.params;

    // Clean up old claim's side effects (topic watches, chat-room membership)
    if (prevPage === 'feed') {
      this.removeFromTopicWatch(ws, 'feed');
    } else if (prevPage === 'post' && prevParams?.id) {
      this.removeFromTopicWatch(ws, `post:${prevParams.id}`);
    } else if (prevPage === 'chat-room' && prevParams?.room) {
      const cb = this.pageLeaveCallbacks.get('chat-room');
      if (cb) cb(ws, prevParams);
    }

    // Remove old claim from pageClaims registry
    if (prevPage) {
      const oldKey = `page:${this.buildPageKey(prevPage, prevParams)}:${ws.userId}:${tabId}`;
      const oldSockets = this.pageClaims.get(oldKey);
      if (oldSockets) {
        oldSockets.delete(ws);
        if (oldSockets.size === 0) this.pageClaims.delete(oldKey);
      }
    }

    // Update tab claim
    ws.tabClaims.set(tabId, { page: newPage, params: newParams });
    ws.page = newPage;
    ws.pageParams = newParams;

    if (newPage === null) return null;

    // Register new claim in pageClaims
    const newKey = `page:${this.buildPageKey(newPage, newParams)}:${ws.userId}:${tabId}`;
    if (!this.pageClaims.has(newKey)) this.pageClaims.set(newKey, new Set());
    this.pageClaims.get(newKey)!.add(ws);

    // Side effects for the new claim
    if (newPage === 'feed') {
      this.addToTopicWatch(ws, 'feed');
    } else if (newPage === 'post' && newParams?.id) {
      this.addToTopicWatch(ws, `post:${newParams.id}`);
    } else if (newPage === 'chat-room' && newParams?.room) {
      const cb = this.pageJoinCallbacks.get('chat-room');
      if (cb) cb(ws, newParams);
    }

    return null;
  }

  cleanupPageClaim(ws: AuthWs, tabId?: string): void {
    if (!ws.userId || !ws.tabClaims) return;

    if (tabId) {
      // Remove claim for a specific tab
      const claim = ws.tabClaims.get(tabId);
      if (!claim) return;
      if (claim.page === 'chat-room' && claim.params?.room) {
        const cb = this.pageLeaveCallbacks.get('chat-room');
        if (cb) cb(ws, claim.params);
      }
      if (claim.page) {
        const key = `page:${this.buildPageKey(claim.page, claim.params)}:${ws.userId}:${tabId}`;
        const sockets = this.pageClaims.get(key);
        if (sockets) {
          sockets.delete(ws);
          if (sockets.size === 0) this.pageClaims.delete(key);
        }
      }
      ws.tabClaims.delete(tabId);
    } else {
      // Remove all claims (connection closing)
      for (const [tId, claim] of ws.tabClaims) {
        if (claim.page === 'chat-room' && claim.params?.room) {
          const cb = this.pageLeaveCallbacks.get('chat-room');
          if (cb) cb(ws, claim.params);
        }
        if (claim.page) {
          const key = `page:${this.buildPageKey(claim.page, claim.params)}:${ws.userId}:${tId}`;
          const sockets = this.pageClaims.get(key);
          if (sockets) {
            sockets.delete(ws);
            if (sockets.size === 0) this.pageClaims.delete(key);
          }
        }
      }
      ws.tabClaims.clear();
    }
  }

  emitToPage(
    userId: string,
    pageKey: string,
    frame: Record<string, unknown>,
  ): number {
    const prefix = `page:${pageKey}:${userId}:`;
    const msg = JSON.stringify(frame);
    let sent = 0;
    for (const [key, sockets] of this.pageClaims) {
      if (!key.startsWith(prefix)) continue;
      for (const ws of sockets) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(msg);
          sent++;
        }
      }
    }
    return sent;
  }

  buildPageKey(page: string, params?: Record<string, string>): string {
    const entry = PAGE_ALLOWLIST[page];
    const keyParams = entry?.key ?? [];
    if (!params || keyParams.length === 0) return page;
    const relevant = keyParams
      .filter((k) => params[k] !== undefined)
      .sort((a, b) => a.localeCompare(b))
      .map((k) => `${k}:${params[k]}`);
    if (relevant.length === 0) return page;
    return `${page}:${relevant.join(':')}`;
  }
}
