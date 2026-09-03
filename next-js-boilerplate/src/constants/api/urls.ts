export const STRIPE_CREATE_SETUP_INTENT_URL =
  "/api/billing/create-setup-intent" as const;
export const STRIPE_SUBSCRIBE_URL = "/api/billing/subscribe" as const;
export const STRIPE_SUBSCRIBE_FINALIZE_URL =
  "/api/billing/subscribe/finalize" as const;

export const AUTH_OAUTH_PREFIX = "/api/auth/oauth/" as const;
export const AUTH_REFRESH_URL = "/api/auth/refresh" as const;
export const AUTH_DEVICE_HANDSHAKE_URL = "/api/auth/device-handshake" as const;
export const CRYPTO_HANDSHAKE_URL = "/api/rest/crypto/handshake" as const;
export const CRYPTO_RE_KEY_URL = "/api/rest/crypto/re-key" as const;
export const AUTH_ME_URL = "/api/auth/me" as const;
export const AUTH_LOGIN_URL = "/api/auth/login" as const;
export const AUTH_LOGIN_MFA_URL = "/api/auth/login/mfa" as const;
export const AUTH_LOGIN_MFA_RESEND_URL = "/api/auth/login/mfa/resend" as const;
export const AUTH_TRUST_DEVICE_URL = "/api/auth/trust-device" as const;
export const AUTH_REGISTER_URL = "/api/auth/register" as const;
export const AUTH_LOGOUT_URL = "/api/auth/logout" as const;
export const AUTH_VERIFY_EMAIL_URL = "/api/auth/verify-email" as const;
export const AUTH_VERIFY_EMAIL_CODE_URL =
  "/api/auth/verify-email/code" as const;
export const AUTH_RESEND_EMAIL_CODE_URL =
  "/api/auth/resend-email-code" as const;
export const AUTH_REQUEST_PASSWORD_RESET_URL =
  "/api/auth/request-password-reset" as const;
export const AUTH_RESET_PASSWORD_URL = "/api/auth/reset-password" as const;
export const AUTH_MFA_ENROLL_URL = "/api/auth/mfa/enroll" as const;
export const AUTH_MFA_VERIFY_URL = "/api/auth/mfa/verify" as const;
export const AUTH_MFA_DISABLE_URL = "/api/auth/mfa/disable" as const;
export const AUTH_CHANGE_PASSWORD_URL = "/api/auth/change-password" as const;
export const AUTH_UNDO_PASSWORD_CHANGE_URL =
  "/api/auth/undo-password-change" as const;

export const POSTS_URL = "/api/posts" as const;
export const POSTS_PREFIX = "/api/posts/" as const;

export const COMMENTS_URL = "/api/comments" as const;
export const COMMENTS_PREFIX = "/api/comments/" as const;

export const REACTIONS_URL = "/api/reactions" as const;

export const NOTIFICATIONS_READ_URL = "/api/notifications/read" as const;

export const PUSH_SUBSCRIBE_URL = "/api/push/subscribe" as const;
export const PUSH_UNSUBSCRIBE_URL = "/api/push/unsubscribe" as const;

export const UPLOAD_URL = "/api/upload" as const;
export const UPLOAD_ATTACHMENT_URL = "/api/upload/attachment" as const;
export const UPLOAD_ATTACHMENT_STREAM_URL =
  "/api/upload/attachment-stream" as const;
export const UPLOAD_SERVE_URL = "/api/upload/serve" as const;

export const ROOMS_URL = "/api/messages/rooms" as const;

export const GQL_URL = "/api/gql" as const;

export const PREMIUM_STATS_URL = "/api/premium/stats" as const;

export const SSE_URL = "/api/sse" as const;

export const OBSERVABILITY_URL = "/api/observability" as const;

export const ECHO_URL = "/api/echo" as const;

export const DATA_URL = "/api/data" as const;

export const SECURITY_NONCE_URL = "/api/security/nonce" as const;

export const PROFILE_URL = "/api/profile" as const;
export const PROFILE_UPDATE_URL = "/api/profile/update" as const;
export const PROFILE_USERNAME_AVAILABLE_PREFIX =
  "/api/profile/username-available" as const;

export const BILLING_SUBSCRIPTION_URL = "/api/billing/subscription" as const;
export const BILLING_PLAN_PRICES_URL = "/api/billing/plan-prices" as const;
export const BILLING_HISTORY_URL = "/api/billing/history" as const;
export const BILLING_PAYMENT_METHODS_URL =
  "/api/billing/payment-methods" as const;
export const BILLING_ADDRESS_URL = "/api/billing/address" as const;
export const BILLING_CANCEL_URL = "/api/billing/cancel" as const;

export const API_KEYS_URL = "/api/api-keys" as const;
export const API_KEYS_PREFIX = "/api/api-keys/" as const;

export const SESSIONS_LIST_URL = "/api/sessions/list" as const;
export const SESSIONS_REVOKE_URL = "/api/sessions/revoke" as const;
export const SESSIONS_REVOKE_OTHERS_URL =
  "/api/sessions/revoke-others" as const;

export const ADMIN_SET_TIER_URL = "/api/admin/set-tier" as const;
export const ADMIN_SET_STATUS_URL = "/api/admin/set-status" as const;
export const ADMIN_RESET_MFA_URL = "/api/admin/reset-mfa" as const;
export const ADMIN_AUDIT_LOGS_URL = "/api/admin/audit-logs" as const;
// Deliberately separate from the general USERS_SEARCH_PREFIX below: this one
// is admin-gated and returns role/status, which the general search (used by
// find-friends/users-directory) must never expose to a non-admin caller.
export const ADMIN_SEARCH_USERS_URL = "/api/admin/search-users" as const;

export const MESSAGES_FRIENDS_URL = "/api/messages/friends" as const;
export const FRIENDS_URL = "/api/friends" as const;
export const MESSAGES_FRIENDS_REQUESTS_URL =
  "/api/messages/friends/requests" as const;
export const MESSAGES_FRIENDS_REQUEST_PREFIX =
  "/api/messages/friends/request/" as const;
export const MESSAGES_FRIENDS_ACCEPT_PREFIX =
  "/api/messages/friends/accept/" as const;
export const MESSAGES_FRIENDS_DECLINE_PREFIX =
  "/api/messages/friends/decline/" as const;
export const MESSAGES_CONVERSATIONS_PREFIX =
  "/api/messages/conversations/" as const;
export const MESSAGES_READ_URL = "/api/messages/read" as const;
export const MESSAGES_FAVORITE_URL = "/api/messages/favorite" as const;
export const MESSAGES_UNFAVORITE_URL = "/api/messages/unfavorite" as const;
export const MESSAGES_MESSAGES_PREFIX = "/api/messages/messages/" as const;

export const USERS_SEARCH_PREFIX = "/api/users/search" as const;

export const FORMS_DEMO_SIMULATE_ERROR_URL =
  "/api/forms-demo/simulate-error" as const;

export const EVENTS_URL = "/api/events" as const;
export const MESSAGES_CONVERSATIONS_URL =
  "/api/messages/conversations" as const;
export const MESSAGES_CONVERSATION_MESSAGES_PREFIX =
  "/api/messages/conversations/" as const;
export const MESSAGES_CONVERSATION_ATTACHMENTS_PREFIX =
  "/api/messages/conversations/" as const;
export const MESSAGES_ROOM_MESSAGES_PREFIX = "/api/messages/rooms/" as const;
export const MESSAGES_ROOM_ATTACHMENTS_PREFIX = "/api/messages/rooms/" as const;
export const MESSAGES_UNREAD_COUNT_URL = "/api/messages/unread-count" as const;
export const CSRF_TOKEN_BACKEND_URL = "/csrf/token" as const;
export const GQL_BACKEND_PATH = "/graphql" as const;
export const VAULT_SECRET_PATH =
  "secret/data/secret/production/frontend" as const;

export const RTC_CALLS_URL = "/api/rtc/calls" as const;
export const RTC_CALLS_PREFIX = "/api/rtc/calls/" as const;
export const RTC_ACTIVE_CALL_URL = "/api/rtc/calls/active" as const;
export const RTC_MEETINGS_URL = "/api/rtc/meetings" as const;
export const RTC_MEETINGS_PREFIX = "/api/rtc/meetings/" as const;
export const RTC_STREAMS_URL = "/api/rtc/streams" as const;
export const RTC_STREAMS_PREFIX = "/api/rtc/streams/" as const;

export const NOTIFICATIONS_URL = "/api/notifications" as const;
export const NOTIFICATIONS_UNREAD_COUNT_URL =
  "/api/notifications/unread-count" as const;
export const USAGE_MESSAGES_URL = "/api/usage/messages" as const;
export const USAGE_STORAGE_URL = "/api/usage/storage" as const;
