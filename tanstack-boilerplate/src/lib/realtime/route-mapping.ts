export function routeToPageClaim(
  pathname: string | null,
  searchParams: URLSearchParams | null,
): { page: string | null; params?: Record<string, string> } {
  if (!pathname) return { page: null };
  const sp = searchParams ?? new URLSearchParams();
  const seg = pathname.split("/").filter(Boolean);
  const route = seg.slice(2).join("/");

  if (route === "messages" || route.startsWith("messages")) {
    const user = sp.get("user");
    if (user) return { page: "messages", params: { peer: user } };
    return { page: "messages" };
  }
  if (route === "find-friends") {
    return { page: "friend-request" };
  }
  if (route === "notification") {
    return { page: "notification" };
  }
  if (route === "feed") {
    return { page: "feed" };
  }
  if (route.startsWith("posts/")) {
    const uuid = route.split("/")[1];
    if (uuid) return { page: "post", params: { id: uuid } };
    return { page: "feed" };
  }
  if (route === "chat-room") {
    const room = sp.get("room") || "general";
    return { page: "chat-room", params: { room } };
  }
  if (route.startsWith("rtc/meetings/")) {
    const slug = route.split("/")[2];
    if (slug) return { page: "rtc-meeting", params: { slug } };
    return { page: null };
  }
  if (route.startsWith("rtc/live/")) {
    const slug = route.split("/")[2];
    // "go-live" is the static setup page (app/v1/[lang]/rtc/live/go-live/),
    // not a dynamic [slug] route — there's no real stream to resync there.
    if (slug && slug !== "go-live")
      return { page: "rtc-stream", params: { slug } };
    return { page: null };
  }
  return { page: null };
}
