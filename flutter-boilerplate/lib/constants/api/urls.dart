class Urls {
  Urls._();

  static const baseUrl = 'http://10.10.2.175:3000';
  static const wsUrl = 'ws://10.10.2.175:3000';

  // Auth
  static const login = '/api/auth/login';
  static const register = '/api/auth/register';
  static const logout = '/api/auth/logout';
  static const me = '/api/auth/me';
  static const token = '/api/auth/token';
  static const devActivate = '/api/auth/dev-activate';
  static const deviceHandshake = '/api/auth/device-handshake';
  static const mfa = '/api/auth/login/mfa';
  static const requestPasswordReset = '/api/auth/request-password-reset';
  static const resetPassword = '/api/auth/reset-password';
  static const verifyEmail = '/api/auth/verify-email';
  static const oauth = '/api/auth/oauth';

  // Billing
  static const billingAddress = '/api/billing/address';
  static const billingCancel = '/api/billing/cancel';
  static const billingCreateSetupIntent = '/api/billing/create-setup-intent';
  static const billingHistory = '/api/billing/history';
  static const billingPaymentMethods = '/api/billing/payment-methods';
  static const billingSubscribe = '/api/billing/subscribe';
  static const billingSubscription = '/api/billing/subscription';

  // Messages
  static const conversations = '/api/messages/conversations';
  static const messages = '/api/messages';
  static const messagesRead = '/api/messages/read';
  static const messagesUnreadCount = '/api/messages/unread-count';

  // Notifications
  static const notifications = '/api/notifications';
  static const notificationsRead = '/api/notifications/read';
  static const notificationsUnreadCount = '/api/notifications/unread-count';

  // Posts
  static const posts = '/api/posts';
  static const comments = '/api/comments';
  static const reactions = '/api/reactions';

  // Profile
  static const profile = '/api/profile';
  static const profileUpdate = '/api/profile/update';
  static const usernameAvailable = '/api/profile/username-available';

  // Feed
  static const feed = '/api/posts';

  // Friends
  static const friends = '/api/messages/friends';
  static const friendRequests = '/api/messages/friend-requests';
  static const acceptFriendRequest = '/api/messages/accept-friend-request';
  static const declineFriendRequest = '/api/messages/decline-friend-request';
  static const sendFriendRequest = '/api/messages/send-friend-request';
  static const suggestedFriends = '/api/friends/suggested';
  static const usersSearch = '/api/users/search';

  // Admin
  static const adminAuditLogs = '/api/admin/audit-logs';
  static const adminSetTier = '/api/admin/set-tier';

  // API Keys
  static const apiKeys = '/api/api-keys';

  // Sessions
  static const sessions = '/api/sessions';
  static const sessionsList = '/api/sessions/list';
  static const sessionsRevoke = '/api/sessions/revoke';
  static const sessionsRevokeOthers = '/api/sessions/revoke-others';

  // Upload
  static const upload = '/api/upload';
  static const uploadMultiple = '/api/upload/multiple';

  // Push
  static const pushSubscribe = '/api/push/subscribe';
  static const pushUnsubscribe = '/api/push/unsubscribe';

  // Premium
  static const premiumStats = '/api/premium/stats';

  // Security
  static const securityNonce = '/api/security/nonce';

  // Events
  static const events = '/api/events';

  // SSE / WebSocket
  static const sse = '/api/sse';
  static const realtimeWs = '/api/realtime';
}
