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
import { StorageCryptoService } from '../wire-crypto/storage-crypto.service';
import { UsageService } from '../usage/usage.service';
import type { RoomMember, MessageAttachment } from './messaging.types';

@Injectable()
export class MessagingService {
  readonly rooms: MessagingRoomService;
  readonly dm: MessagingDmService;
  readonly friends: MessagingFriendService;
  readonly realtime: RealtimeGateway;

  constructor(
    prisma: PrismaService,
    cache: CacheAsideService,
    friendsSvc: FriendsService,
    tokenStore: TokenStoreService,
    notifications: NotificationService,
    realtime: RealtimeGateway,
    push: PushNotificationService,
    @Inject(REDIS_CLIENT) redis: Redis,
    storageCrypto: StorageCryptoService,
    usage: UsageService,
  ) {
    this.realtime = realtime;
    this.rooms = new MessagingRoomService(prisma, redis, storageCrypto, usage);
    this.dm = new MessagingDmService(
      prisma,
      cache,
      realtime,
      push,
      storageCrypto,
      usage,
    );
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

  getConversationAttachments(
    userId: string,
    otherUserId: string,
    before?: string,
    take?: number,
  ) {
    return this.dm.getConversationAttachments(
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
    text = '',
    friends?: string[],
    attachments?: MessageAttachment[],
    envelope?: Record<string, unknown>,
    replyToId?: string,
  ) {
    return this.dm.sendMessage(
      senderId,
      recipientId,
      text,
      (a, b) => this.friends.areFriends(a, b),
      friends,
      attachments,
      envelope,
      replyToId,
    );
  }

  async sendAndDeliverMessage(
    senderId: string,
    recipientId: string,
    text = '',
    tempId?: string,
    attachments?: MessageAttachment[],
    storageEnvelope?: Record<string, unknown>,
    deliveryPlaintext?: { text?: string; attachments?: unknown },
    replyToId?: string,
  ) {
    const result = await this.dm.sendAndDeliverMessage(
      senderId,
      recipientId,
      text,
      (a, b) => this.friends.areFriends(a, b),
      undefined,
      tempId,
      attachments,
      storageEnvelope,
      deliveryPlaintext,
      replyToId,
    );
    // REST/GraphQL send path — the WS hub emits these itself. Push the
    // plaintext `direct-message` payload to every device of both peers so
    // the open conversation updates live without a refetch.
    await this.realtime.emitToUserEncrypted(
      result.message.recipientId,
      result.delivery.recipientPayload,
    );
    await this.realtime.emitToUserEncrypted(
      result.message.senderId,
      result.delivery.senderPayload,
    );
    return result;
  }

  markConversationRead(readerId: string, peerId: string) {
    return this.dm.markConversationRead(readerId, peerId, (id) =>
      this.friends.getUserDisplay(id),
    );
  }

  deliverDirectMessage(
    message: Parameters<MessagingDmService['deliverDirectMessage']>[0],
    deliveryPlaintext?: Parameters<
      MessagingDmService['deliverDirectMessage']
    >[1],
  ) {
    return this.dm.deliverDirectMessage(message, deliveryPlaintext);
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

  deleteMessageForMe(userId: string, messageId: string) {
    return this.dm.deleteMessageForMe(userId, messageId);
  }

  deleteMessageForEveryone(userId: string, messageId: string) {
    return this.dm.deleteMessageForEveryone(userId, messageId);
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

  persistJoin(roomSlug: string, userId: string) {
    return this.rooms.persistJoin(roomSlug, userId);
  }

  leaveRoom(room: string, socketId: string) {
    return this.rooms.leaveRoom(room, socketId);
  }

  persistLeave(roomSlug: string, userId: string) {
    return this.rooms.persistLeave(roomSlug, userId);
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

  getRoomUserIds(room: string) {
    return this.rooms.getRoomUserIds(room);
  }

  saveRoomMessage(
    roomId: string,
    senderId: string,
    tier: string | undefined,
    body: string,
    attachments?: MessageAttachment[],
    envelope?: Record<string, unknown>,
  ) {
    return this.rooms.saveRoomMessage(
      roomId,
      senderId,
      tier,
      body,
      attachments,
      envelope,
    );
  }

  getRoomMessages(
    roomId: string,
    tier: string | undefined,
    before?: string,
    take?: number,
  ) {
    return this.rooms.getRoomMessages(roomId, tier, before, take);
  }

  getRoomAttachments(
    roomId: string,
    tier: string | undefined,
    before?: string,
    take?: number,
  ) {
    return this.rooms.getRoomAttachments(roomId, tier, before, take);
  }
}

export {
  CHAT_ROOMS,
  VIP_ROOM_PREFIX,
  isValidRoom,
  hasRoomTierAccess,
} from './messaging-room.service';
export type { ChatRoom } from './messaging-room.service';
