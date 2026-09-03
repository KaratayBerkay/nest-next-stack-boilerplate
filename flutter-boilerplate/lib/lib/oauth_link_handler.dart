import 'dart:async';

import 'package:app_links/app_links.dart';

import 'riverpod_compat.dart';

/// What a completed provider handshake delivers back to the app on the
/// `flutterboilerplate://oauth/callback` link: the `state` the app chose
/// when it started the flow, and the one-time `claim` the backend minted
/// when the provider callback completed (CROSS-032).
class OAuthCallback {
  final String state;
  final String? claim;

  const OAuthCallback({required this.state, required this.claim});
}

class PendingOAuth {
  final String state;
  final String provider;

  /// PKCE-style verifier whose S256 digest was registered with the backend
  /// as `code_challenge` when the flow started. Held only here, in memory —
  /// it must never travel over the (non-exclusive) custom scheme, because
  /// it is exactly what an app squatting that scheme lacks.
  final String codeVerifier;
  final Completer<OAuthCallback> completer;

  PendingOAuth({
    required this.state,
    required this.provider,
    required this.codeVerifier,
    required this.completer,
  });
}

final pendingOAuthProvider = StateProvider<PendingOAuth?>((ref) => null);

/// Parses an incoming link; returns null for anything that is not this
/// app's OAuth callback. A callback with no `claim` still parses (claim
/// null) so the caller can fail the pending login loudly instead of
/// silently waiting for a timeout.
OAuthCallback? parseOAuthCallbackUri(Uri uri) {
  // `flutterboilerplate://oauth/callback` parses with 'oauth' as the URI
  // *host* (authority), not a path segment, so pathSegments is just
  // ['callback'] — check scheme+host, then the remaining path segment.
  if (uri.scheme != 'flutterboilerplate' || uri.host != 'oauth') return null;
  final segments = uri.pathSegments;
  if (segments.isEmpty || segments[0] != 'callback') return null;

  final state = uri.queryParameters['state'];
  if (state == null || state.isEmpty) return null;
  final claim = uri.queryParameters['claim'];
  return OAuthCallback(
    state: state,
    claim: (claim == null || claim.isEmpty) ? null : claim,
  );
}

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
    final callback = parseOAuthCallbackUri(uri);
    if (callback == null) return;

    final pending = ref.read(pendingOAuthProvider);
    if (pending == null || pending.state != callback.state) return;

    // Clear first: the same link can be delivered twice (initial link +
    // stream), and a second delivery must find nothing to complete.
    ref.read(pendingOAuthProvider.notifier).state = null;
    if (callback.claim == null) {
      pending.completer.completeError(
        StateError('OAuth callback carried no claim'),
      );
      return;
    }
    pending.completer.complete(callback);
  }

  void dispose() {
    _sub?.cancel();
  }
}
