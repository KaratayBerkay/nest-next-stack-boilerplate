export interface NotificationPayload {
  kind?: string;
  postId?: string;
  [key: string]: unknown;
}

export function notificationTarget(
  payload: NotificationPayload | undefined | null,
  lang: string,
): string | null {
  if (!payload) return null;
  if (payload.kind === "friend-request" || payload.kind === "friend-accepted") {
    return `/v1/${lang}/find-friends/requests`;
  }
  if (payload.postId) {
    return `/v1/${lang}/posts/${payload.postId}`;
  }
  return null;
}
