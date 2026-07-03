export interface AuthFrame {
  type: 'auth';
  tokens: {
    accessToken: string;
    rbacToken: string;
    deviceToken: string;
    userToken: string;
  };
}

export interface RegisterFrame {
  type: 'register';
  services: string[];
}

export interface WatchFrame {
  type: 'watch';
  topic: string;
}

export interface UnwatchFrame {
  type: 'unwatch';
  topic: string;
}

export type RenewFrame =
  | { renew: 'Notifications'; type: 'Count'; value: number }
  | { renew: 'Notifications'; type: 'Item'; item: Record<string, unknown> }
  | {
      renew: 'Messages';
      type: 'Conversation';
      conversation: Record<string, unknown>;
    }
  | { renew: 'Feed'; type: 'New' }
  | { renew: 'Feed'; type: 'Post'; id: string };

export type EventFrame =
  | { type: 'direct-message'; message: Record<string, unknown> }
  | { type: 'message-read'; readerId: string; senderId: string; readAt: string }
  | {
      type: 'message-delivered';
      userId: string;
      messageId: string;
      deliveredAt: string;
    }
  | {
      type: 'room-message';
      room: string;
      message: Record<string, unknown>;
      tempId?: string;
    }
  | {
      type: 'user-joined';
      room: string;
      user: Record<string, unknown>;
      members: unknown[];
    }
  | { type: 'user-left'; room: string; members: unknown[] }
  | {
      type: 'user-online';
      user: { id: string; name?: string; avatar?: string };
    }
  | { type: 'user-offline'; userId: string }
  | { type: 'online-users'; users: { id: string }[] }
  | { type: 'room-counts'; rooms: Record<string, number> }
  | { type: 'authenticated' }
  | { type: 'registered'; services: string[] }
  | { type: 'error'; message: string };

export type Frame = RenewFrame | EventFrame;
