import 'dart:async';

import 'package:app_links/app_links.dart';

import 'riverpod_compat.dart';

class PendingOAuth {
  final String state;
  final String provider;
  final Completer<String> completer;

  PendingOAuth({
    required this.state,
    required this.provider,
    required this.completer,
  });
}

final pendingOAuthProvider =
    StateProvider<PendingOAuth?>((ref) => null);

class OAuthLinkHandler {
  final AppLinks _appLinks = AppLinks();
  StreamSubscription<Uri>? _sub;

  Future<void> init(WidgetRef ref) async {
    final initialUri = await _appLinks.getInitialLink();
    if (initialUri != null) {
      _handleUri(initialUri, ref);
    }

    _sub = _appLinks.uriLinkStream.listen((uri) {
      _handleUri(uri, ref);
    });
  }

  void _handleUri(Uri uri, WidgetRef ref) {
    final segments = uri.pathSegments;
    if (segments.length < 2) return;
    if (segments[0] != 'oauth' || segments[1] != 'callback') return;

    final state = uri.queryParameters['state'];
    if (state == null) return;

    final pending = ref.read(pendingOAuthProvider);
    if (pending == null || pending.state != state) return;

    pending.completer.complete(state);
    ref.read(pendingOAuthProvider.notifier).state = null;
  }

  void dispose() {
    _sub?.cancel();
  }
}
