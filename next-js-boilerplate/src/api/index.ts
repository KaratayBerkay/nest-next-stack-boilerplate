// server types
export type { UserSearchResult } from "./server/users/search";
export type { ProfileData } from "./server/profile/get";
export type {
  NotificationItem,
  NotificationsResult,
} from "./server/notifications/list";
export type { Conversation } from "./server/messages/conversations";
export type {
  Message,
  ConversationPage,
} from "./server/messages/conversation-messages";
export type { RoomMessage } from "./server/messages/room-messages";
export type { FriendUser } from "./server/messages/friends";
export type { FriendRequest as ServerFriendRequest } from "./server/messages/friend-requests";
export type { FeedPost, FeedListResult } from "./server/posts/list";
export type { SinglePost } from "./server/posts/single";
export type {
  AuditLogEntry,
  AuditLogResponse,
  AuditLogParams,
} from "./server/admin/audit-logs";
export type { SubscriptionInfo } from "./server/billing/subscription";
export type { BillingHistoryEntry } from "./server/billing/history";
export type { PremiumStats } from "./server/premium/stats";
export type { GrowthStats } from "./server/premium/growth-stats";
export type { SessionInfo } from "./server/sessions/list";
export type { ApiKeyInfo } from "./server/api-keys/list";
export type { CreateApiKeyResult } from "./server/api-keys/create";
export type { SuggestedFriend } from "./server/friends/suggested";
export type { PostStats } from "./server/posts/stats";
export type { LoginResult } from "./server/auth/login";
export type { RegisterResult } from "./server/auth/register";
export type { GetMeResult } from "./server/auth/me";
export type { RefreshTokenResult } from "./server/auth/token";
export type { VerifyEmailResult } from "./server/auth/verify-email";
export type { RequestPasswordResetResult } from "./server/auth/request-password-reset";
export type { ResetPasswordResult } from "./server/auth/reset-password";
export type { UploadAvatarResult } from "./server/profile/upload-avatar";
export type { UpdateProfileParams } from "./server/profile/update";

// client — queries
export { searchUsersQueryOptions } from "./client/users/search";
export {
  notificationsQueryOptions,
  unreadCountQueryOptions,
  dmUnreadCountQueryOptions,
} from "./client/notifications/query";
export {
  conversationsQueryOptions,
  conversationMessagesQueryOptions,
  roomMessagesQueryOptions,
} from "./client/messages/query";
export {
  friendsQueryOptions,
  friendRequestsQueryOptions,
} from "./client/friends/query";
export { auditLogsQueryOptions } from "./client/admin/query";
export {
  subscriptionQueryOptions,
  billingHistoryQueryOptions,
} from "./client/billing/query";
export {
  feedListQueryOptions,
  singlePostQueryOptions,
} from "./client/posts/query";
export { sessionsListQueryOptions } from "./client/sessions/query";
export { apiKeyListQueryOptions } from "./client/api-keys/query";
export { premiumStatsQueryOptions } from "./client/premium/query";

// client — mutations / actions
export { useMarkNotificationRead } from "./client/notifications/mark-read";
export { useNotificationActions } from "./client/notifications/actions";
export { useMarkMessagesRead } from "./client/messages/mark-read";
export { useMessageActions } from "./client/messages/actions";
export { useFriendActions } from "./client/friends/actions";
export { usePostActions } from "./client/posts/actions";
export { useProfileActions } from "./client/profile/actions";
export { useBillingActions } from "./client/billing/actions";
export { useAdminActions } from "./client/admin/actions";
export { useSessionActions } from "./client/sessions/actions";
export { useApiKeyActions } from "./client/api-keys/actions";
export { useAuthActions } from "./client/auth/actions";
export { usePushNotificationActions } from "./client/push-notifications/actions";
export { logEvents } from "./client/events/actions";
