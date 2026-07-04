export interface NotificationPayload {
  kind?: string;
  senderId?: string;
  postId?: string;
  [key: string]: unknown;
}

export function notificationTarget(
  payload: NotificationPayload | undefined | null,
  lang: string,
): string | null {
  if (!payload) return null;
  if (payload.kind === "direct-message" && payload.senderId) {
    return `/v1/${lang}/messages?user=${payload.senderId}`;
  }
  if (
    payload.kind === "friend-request" ||
    payload.kind === "friend-accepted"
  ) {
    return `/v1/${lang}/find-friends`;
  }
  if (payload.postId) {
    return `/v1/${lang}/feed#post-${payload.postId}`;
  }
  return null;
}
