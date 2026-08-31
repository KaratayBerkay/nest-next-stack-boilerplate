export interface NotificationPayload {
  kind?: string;
  postId?: string;
  slug?: string;
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
  if (payload.kind === "rtc-missed-call") {
    return `/v1/${lang}/rtc/calls`;
  }
  if (payload.kind === "rtc-meeting-invite" && payload.slug) {
    return `/v1/${lang}/rtc/meetings/${payload.slug}`;
  }
  if (payload.kind === "rtc-stream-live" && payload.slug) {
    return `/v1/${lang}/rtc/live/${payload.slug}`;
  }
  if (payload.postId) {
    return `/v1/${lang}/posts/${payload.postId}`;
  }
  return null;
}
