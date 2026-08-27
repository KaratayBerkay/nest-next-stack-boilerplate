typedef PageClaim = ({String? page, Map<String, String>? params});

/// Mirrors next-js-boilerplate's `routeToPageClaim` (route-mapping.ts) so
/// the mobile app claims the same server-side pages the web app does.
/// Flutter's own `chat-room` route uses the query param `conversation`,
/// not `room` like the web app (see `app/router.dart`'s `v1ChatRoom` route)
/// — this follows Flutter's router, not the web constant name.
PageClaim routeToPageClaim(Uri uri) {
  final seg = uri.pathSegments.where((s) => s.isNotEmpty).toList();
  final route = seg.length > 2 ? seg.sublist(2).join('/') : '';
  final qp = uri.queryParameters;

  if (route == 'messages' || route.startsWith('messages')) {
    return (page: 'messages', params: null);
  }
  if (route == 'find-friends') {
    return (page: 'friend-request', params: null);
  }
  if (route == 'notification') {
    return (page: 'notification', params: null);
  }
  if (route == 'feed') {
    return (page: 'feed', params: null);
  }
  if (route.startsWith('posts/')) {
    final uuid = route.split('/').length > 1 ? route.split('/')[1] : '';
    if (uuid.isNotEmpty) {
      return (page: 'post', params: {'id': uuid});
    }
    return (page: 'feed', params: null);
  }
  if (route == 'chat-room') {
    final room = qp['conversation'] ?? 'general';
    return (page: 'chat-room', params: {'room': room});
  }
  if (route.startsWith('chat/')) {
    final parts = route.split('/');
    final room = parts.length > 1 && parts[1].isNotEmpty ? parts[1] : 'general';
    return (page: 'chat-room', params: {'room': room});
  }
  // Web's route-mapping.ts also produces `rtc-meeting`/`rtc-stream` claims
  // here, but the backend's PAGE_ALLOWLIST doesn't know those pages and
  // rejects them with an error frame — which this app surfaces as a snackbar
  // (web silently drops error frames). RTC room pages handle their own
  // reconnect catch-up locally instead (see their realtimeStatusProvider
  // listeners), so no rtc claims are emitted from here.
  return (page: null, params: null);
}
