import { RealtimePageManager } from './realtime-page.manager';

interface MockWs {
  readyState: number;
  userId?: string;
  page?: string | null;
  pageParams?: Record<string, string>;
  tabClaims?: Map<
    string,
    { page: string | null; params?: Record<string, string> }
  >;
  watchedTopics?: string[];
  send: jest.Mock;
  close: jest.Mock;
  [key: string]: unknown;
}

function makeWs(overrides: Record<string, unknown> = {}): MockWs {
  return {
    readyState: 1,
    userId: 'u1',
    page: null,
    pageParams: {},
    tabClaims: new Map(),
    watchedTopics: [],
    send: jest.fn(),
    close: jest.fn(),
    ...overrides,
  };
}

describe('RealtimePageManager', () => {
  let manager: RealtimePageManager;

  beforeEach(() => {
    manager = new RealtimePageManager();
  });

  describe('handlePage', () => {
    it('sets page and params on the websocket', () => {
      const ws = makeWs() as unknown as Parameters<
        typeof manager.handlePage
      >[0];
      manager.handlePage(ws, { page: 'messages', params: { peer: 'u2' } });

      expect(ws.page).toBe('messages');
      expect(ws.pageParams).toEqual({ peer: 'u2' });
      expect(ws.tabClaims.get('_default')).toEqual({
        page: 'messages',
        params: { peer: 'u2' },
      });
    });

    it('returns null for valid claims', () => {
      const ws = makeWs() as unknown as Parameters<
        typeof manager.handlePage
      >[0];
      const error = manager.handlePage(ws, { page: 'notification' });
      expect(error).toBeNull();
    });

    it('rejects invalid page names', () => {
      const ws = makeWs() as unknown as Parameters<
        typeof manager.handlePage
      >[0];
      const error = manager.handlePage(ws, { page: 'nonexistent' });
      expect(error).toContain('Invalid page');
    });

    it('rejects unallowed params', () => {
      const ws = makeWs() as unknown as Parameters<
        typeof manager.handlePage
      >[0];
      const error = manager.handlePage(ws, {
        page: 'messages',
        params: { invalid: 'true' },
      });
      expect(error).toContain('Invalid param');
    });

    it('allows valid params per page type', () => {
      const ws = makeWs() as unknown as Parameters<
        typeof manager.handlePage
      >[0];
      const error = manager.handlePage(ws, {
        page: 'chat-room',
        params: { room: 'general' },
      });
      expect(error).toBeNull();
    });

    it('overwrites previous claim for the same tabId', () => {
      const ws = makeWs() as unknown as Parameters<
        typeof manager.handlePage
      >[0];

      manager.handlePage(ws, {
        page: 'messages',
        params: { peer: 'u2' },
        tabId: 'tab-a',
      });
      manager.handlePage(ws, {
        page: 'notification',
        tabId: 'tab-a',
      });

      // Only notification should be claimable for tab-a
      const sentNotif = manager.emitToPage('u1', 'notification', {
        type: 'test',
      });
      expect(sentNotif).toBe(1);

      const sentMsg = manager.emitToPage('u1', 'messages', { type: 'test' });
      expect(sentMsg).toBe(0);
    });

    it('allows different tabIds to claim different pages simultaneously (fixes §8)', () => {
      const ws = makeWs() as unknown as Parameters<
        typeof manager.handlePage
      >[0];

      manager.handlePage(ws, {
        page: 'messages',
        params: { peer: 'u2' },
        tabId: 'tab-a',
      });
      manager.handlePage(ws, {
        page: 'notification',
        tabId: 'tab-b',
      });

      // Both pages should receive events
      const sentMsg = manager.emitToPage('u1', 'messages', {
        type: 'direct-message',
      });
      expect(sentMsg).toBe(1);

      const sentNotif = manager.emitToPage('u1', 'notification', {
        type: 'test',
      });
      expect(sentNotif).toBe(1);
    });

    it('handles null page (clearing the claim)', () => {
      const ws = makeWs() as unknown as Parameters<
        typeof manager.handlePage
      >[0];
      manager.handlePage(ws, { page: 'messages' });
      manager.handlePage(ws, { page: null });

      const sent = manager.emitToPage('u1', 'messages', { type: 'test' });
      expect(sent).toBe(0);
    });

    it('requires userId on ws', () => {
      const ws = makeWs({
        userId: undefined,
        page: undefined,
      }) as unknown as Parameters<typeof manager.handlePage>[0];
      const error = manager.handlePage(ws, { page: 'messages' });
      expect(error).toBeNull();
      expect(ws.page).toBeUndefined();
    });

    it('adds feed topic watch on feed page claim', () => {
      const ws = makeWs({ watchedTopics: [] }) as unknown as Parameters<
        typeof manager.handlePage
      >[0];
      manager.handlePage(ws, { page: 'feed' });

      expect(ws.watchedTopics).toContain('feed');
      expect(manager.topicWatchers.has('feed')).toBe(true);
    });

    it('removes feed topic watch when leaving feed page', () => {
      const ws = makeWs() as unknown as Parameters<
        typeof manager.handlePage
      >[0];
      manager.handlePage(ws, { page: 'feed' });
      manager.handlePage(ws, { page: 'messages' });

      expect(ws.watchedTopics).not.toContain('feed');
    });
  });

  describe('emitToPage', () => {
    it('sends frame to sockets matching page key and userId', () => {
      const ws = makeWs() as unknown as Parameters<
        typeof manager.handlePage
      >[0];
      manager.handlePage(ws, { page: 'messages', params: { peer: 'u2' } });

      const sent = manager.emitToPage('u1', 'messages', {
        type: 'direct-message',
      });

      expect(sent).toBe(1);
      expect(ws.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'direct-message' }),
      );
    });

    it('returns 0 when no sockets match the page key', () => {
      const ws = makeWs() as unknown as Parameters<
        typeof manager.handlePage
      >[0];
      manager.handlePage(ws, { page: 'notification' });

      const sent = manager.emitToPage('u1', 'messages', { type: 'test' });
      expect(sent).toBe(0);
    });

    it('returns 0 when user has no claims', () => {
      const sent = manager.emitToPage('u1', 'messages', { type: 'test' });
      expect(sent).toBe(0);
    });

    it('skips closed sockets', () => {
      const ws = makeWs({ readyState: 3 }) as unknown as Parameters<
        typeof manager.handlePage
      >[0];
      manager.handlePage(ws, { page: 'messages' });

      const sent = manager.emitToPage('u1', 'messages', { type: 'test' });
      expect(sent).toBe(0);
    });
  });

  describe('buildPageKey', () => {
    it('returns page name when no key params defined', () => {
      const key = manager.buildPageKey('notification');
      expect(key).toBe('notification');
    });

    it('includes key params sorted', () => {
      const key = manager.buildPageKey('post', { id: 'abc' });
      expect(key).toBe('post:id:abc');
    });

    it('returns just page name when params are missing', () => {
      const key = manager.buildPageKey('chat-room');
      expect(key).toBe('chat-room');
    });
  });

  describe('cleanupPageClaim', () => {
    it('removes a specific tab claim', () => {
      const ws = makeWs() as unknown as Parameters<
        typeof manager.handlePage
      >[0];
      manager.handlePage(ws, {
        page: 'messages',
        tabId: 'tab-a',
      });
      manager.handlePage(ws, {
        page: 'notification',
        tabId: 'tab-b',
      });

      manager.cleanupPageClaim(ws, 'tab-a');

      // tab-a's claim should be gone, tab-b's should remain
      expect(manager.emitToPage('u1', 'messages', { type: 'test' })).toBe(0);
      expect(manager.emitToPage('u1', 'notification', { type: 'test' })).toBe(
        1,
      );
    });

    it('removes all claims when no tabId provided', () => {
      const ws = makeWs() as unknown as Parameters<
        typeof manager.handlePage
      >[0];
      manager.handlePage(ws, { page: 'messages' });
      manager.handlePage(ws, { page: 'notification', tabId: 'tab-b' });

      manager.cleanupPageClaim(ws);

      expect(manager.emitToPage('u1', 'messages', { type: 'test' })).toBe(0);
      expect(manager.emitToPage('u1', 'notification', { type: 'test' })).toBe(
        0,
      );
    });

    it('fires chat-room leave callback when applicable', () => {
      const onLeave = jest.fn();
      manager.registerPageCallbacks('chat-room', jest.fn(), onLeave);

      const ws = makeWs() as unknown as Parameters<
        typeof manager.handlePage
      >[0];
      manager.handlePage(ws, {
        page: 'chat-room',
        params: { room: 'general' },
      });

      manager.cleanupPageClaim(ws);

      expect(onLeave).toHaveBeenCalledWith(ws, { room: 'general' });
    });
  });

  describe('handleWatch / handleUnwatch', () => {
    it('adds ws to topic watchers', () => {
      const ws = makeWs() as unknown as Parameters<
        typeof manager.handleWatch
      >[0];
      const error = manager.handleWatch(ws, { topic: 'feed' });

      expect(error).toBeNull();
      expect(manager.topicWatchers.get('feed')?.has(ws)).toBe(true);
    });

    it('rejects invalid topic patterns', () => {
      const ws = makeWs() as unknown as Parameters<
        typeof manager.handleWatch
      >[0];
      const error = manager.handleWatch(ws, {
        topic: '../../etc/passwd',
      });

      expect(error).toBe('Invalid topic pattern');
    });

    it('removes ws from topic watchers on unwatch', () => {
      const ws = makeWs() as unknown as Parameters<
        typeof manager.handleWatch
      >[0];
      manager.handleWatch(ws, { topic: 'feed' });

      manager.handleUnwatch(ws, { topic: 'feed' });

      expect(manager.topicWatchers.has('feed')).toBe(false);
    });
  });

  describe('cleanupTopicWatches', () => {
    it('removes ws from all topic watchers', () => {
      const ws = makeWs() as unknown as Parameters<
        typeof manager.handleWatch
      >[0];
      manager.handleWatch(ws, { topic: 'feed' });
      manager.handleWatch(ws, { topic: 'post:abc' });

      manager.cleanupTopicWatches(ws);

      expect(manager.topicWatchers.has('feed')).toBe(false);
      expect(manager.topicWatchers.has('post:abc')).toBe(false);
    });
  });
});
