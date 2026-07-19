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
    data: { page: string | null; params?: Record<string, string> },
  ): string | null {
    if (!ws.userId) return null;

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

    // Clean up old claim
    if (ws.page === 'feed') {
      this.removeFromTopicWatch(ws, 'feed');
    } else if (ws.page === 'post' && ws.pageParams?.id) {
      this.removeFromTopicWatch(ws, `post:${ws.pageParams.id}`);
    } else if (ws.page === 'chat-room' && ws.pageParams?.room) {
      const cb = this.pageLeaveCallbacks.get('chat-room');
      if (cb) cb(ws, ws.pageParams);
    }

    if (ws.page) {
      const oldKey = `page:${this.buildPageKey(ws.page, ws.pageParams)}:${ws.userId}`;
      const oldSockets = this.pageClaims.get(oldKey);
      if (oldSockets) {
        oldSockets.delete(ws);
        if (oldSockets.size === 0) this.pageClaims.delete(oldKey);
      }
    }

    ws.page = newPage;
    ws.pageParams = newParams;

    if (newPage === null) return null;

    const newKey = `page:${this.buildPageKey(newPage, newParams)}:${ws.userId}`;
    if (!this.pageClaims.has(newKey)) this.pageClaims.set(newKey, new Set());
    this.pageClaims.get(newKey)!.add(ws);

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

  cleanupPageClaim(ws: AuthWs): void {
    if (!ws.userId) return;
    if (ws.page === 'chat-room' && ws.pageParams?.room) {
      const cb = this.pageLeaveCallbacks.get('chat-room');
      if (cb) cb(ws, ws.pageParams);
    }
    if (ws.page) {
      const key = `page:${this.buildPageKey(ws.page, ws.pageParams)}:${ws.userId}`;
      const sockets = this.pageClaims.get(key);
      if (sockets) {
        sockets.delete(ws);
        if (sockets.size === 0) this.pageClaims.delete(key);
      }
    }
  }

  emitToPage(
    userId: string,
    pageKey: string,
    frame: Record<string, unknown>,
  ): number {
    const key = `page:${pageKey}:${userId}`;
    const sockets = this.pageClaims.get(key);
    if (!sockets) return 0;
    const msg = JSON.stringify(frame);
    let sent = 0;
    for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
        sent++;
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
