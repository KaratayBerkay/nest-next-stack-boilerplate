import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';
import { FriendsService } from '../friends/friends.service';
import { TokenStoreService } from '../auth/token-store.service';
import { NotificationService } from '../notification/notification.service';
import { CacheAsideService } from '../caching/cache-aside.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PushNotificationService } from '../push-notification/push-notification.service';
import { REDIS_CLIENT } from '../redis/redis.tokens';
import { MessagingRoomService } from './messaging-room.service';
import { MessagingDmService } from './messaging-dm.service';
import { MessagingFriendService } from './messaging-friend.service';
import type { RoomMember } from './messaging.types';

@Injectable()
export class MessagingService {
  readonly rooms: MessagingRoomService;
  readonly dm: MessagingDmService;
  readonly friends: MessagingFriendService;

  constructor(
    prisma: PrismaService,
    cache: CacheAsideService,
    friendsSvc: FriendsService,
    tokenStore: TokenStoreService,
    notifications: NotificationService,
    realtime: RealtimeGateway,
    push: PushNotificationService,
    @Inject(REDIS_CLIENT) redis: Redis,
  ) {
    this.rooms = new MessagingRoomService(prisma, redis);
    this.dm = new MessagingDmService(prisma, cache, realtime, push);
    this.friends = new MessagingFriendService(
      prisma,
      cache,
      friendsSvc,
      tokenStore,
      notifications,
    );
  }

  // === Delegated DM methods ===

  getConversations(userId: string) {
    return this.dm.getConversations(userId, (id) =>
      this.friends.getFriendIds(id),
    );
  }

  getMessages(
    userId: string,
    otherUserId: string,
    before?: string,
    take?: number,
  ) {
    return this.dm.getMessages(
      userId,
      otherUserId,
      (a, b) => this.friends.areFriends(a, b),
      before,
      take,
    );
  }

  sendMessage(
    senderId: string,
    recipientId: string,
    text: string,
    friends?: string[],
  ) {
    return this.dm.sendMessage(
      senderId,
      recipientId,
      text,
      (a, b) => this.friends.areFriends(a, b),
      friends,
    );
  }

  deliverDirectMessage(
    message: Parameters<MessagingDmService['deliverDirectMessage']>[0],
  ) {
    return this.dm.deliverDirectMessage(message);
  }

  getUnreadCount(userId: string, peerId: string) {
    return this.dm.getUnreadCount(userId, peerId);
  }

  getTotalUnreadCount(userId: string) {
    return this.dm.getTotalUnreadCount(userId);
  }

  markRead(userId: string, otherUserId: string) {
    return this.dm.markRead(userId, otherUserId);
  }

  // === Delegated friend methods ===

  getUsers(currentUserId: string, search?: string) {
    return this.friends.getUsers(currentUserId, search);
  }

  getFriendIds(userId: string) {
    return this.friends.getFriendIds(userId);
  }

  getUserDisplay(userId: string) {
    return this.friends.getUserDisplay(userId);
  }

  getFriends(userId: string, search?: string) {
    return this.friends.getFriends(userId, search);
  }

  getFriendRequests(userId: string) {
    return this.friends.getFriendRequests(userId);
  }

  sendFriendRequest(requesterId: string, addresseeId: string) {
    return this.friends.sendFriendRequest(requesterId, addresseeId);
  }

  acceptFriendRequest(userId: string, requesterId: string) {
    return this.friends.acceptFriendRequest(userId, requesterId);
  }

  declineFriendRequest(userId: string, requesterId: string) {
    return this.friends.declineFriendRequest(userId, requesterId);
  }

  areFriends(userId1: string, userId2: string) {
    return this.friends.areFriends(userId1, userId2);
  }

  // === Delegated room methods ===

  joinRoom(room: string, member: RoomMember) {
    return this.rooms.joinRoom(room, member);
  }

  leaveRoom(room: string, socketId: string) {
    return this.rooms.leaveRoom(room, socketId);
  }

  leaveAllRooms(socketId: string) {
    return this.rooms.leaveAllRooms(socketId);
  }

  getRoomCounts() {
    return this.rooms.getRoomCounts();
  }

  getRoomMembers(room: string) {
    return this.rooms.getRoomMembers(room);
  }

  saveRoomMessage(roomId: string, senderId: string, body: string) {
    return this.rooms.saveRoomMessage(roomId, senderId, body);
  }

  getRoomMessages(roomId: string, before?: string, take?: number) {
    return this.rooms.getRoomMessages(roomId, before, take);
  }
}

export {
  CHAT_ROOMS,
  VIP_ROOM_PREFIX,
  isValidRoom,
} from './messaging-room.service';
export type { ChatRoom } from './messaging-room.service';
