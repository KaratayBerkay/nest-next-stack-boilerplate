import 'package:flutter_boilerplate/lib/realtime/realtime_client.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_boilerplate/lib/realtime/route_claim.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../app/router.dart';
import 'use_auth.dart';

final realtimeLifecycleProvider = Provider<RealtimeLifecycle>((ref) {
  final lifecycle = RealtimeLifecycle(ref);
  ref.onDispose(() => lifecycle.dispose());
  return lifecycle;
});

class RealtimeLifecycle {
  final Ref _ref;

  RealtimeLifecycle(this._ref) {
    _setup();
  }

  void _setup() {
    _ref.listen(isAuthenticatedProvider, (prev, next) {
      if (next == true) {
        _connect();
      } else {
        _disconnect();
      }
    });

    if (_ref.read(isAuthenticatedProvider)) {
      _connect();
    }
  }

  void _connect() {
    final client = _ref.read(realtimeProvider);
    client.registerServices(['MESSAGE', 'NOTIFICATION']);
    client.watch('feed');
    client.connect();

    _ref.read(routerProvider).routerDelegate.addListener(_onRouteChanged);
    _claimCurrentRoute();
  }

  void _onRouteChanged() => _claimCurrentRoute();

  /// Claims the current route as the realtime "page" so the server can
  /// auto-watch feed/post topics and join chat rooms (see
  /// convert-frontend-7-flutter.md §9.1). Re-runs on every navigation,
  /// including query-param-only changes, since `GoRouterDelegate` (a
  /// `RouterDelegate`, per the Flutter SDK contract) notifies listeners on
  /// those too.
  void _claimCurrentRoute() {
    final router = _ref.read(routerProvider);
    final uri = router.routerDelegate.currentConfiguration.uri;
    final claim = routeToPageClaim(uri);
    _ref.read(realtimeProvider).claimPage(claim.page, params: claim.params);
  }

  void _disconnect() {
    _ref.read(routerProvider).routerDelegate.removeListener(_onRouteChanged);
    final client = _ref.read(realtimeProvider);
    client.disconnect();
  }

  void dispose() {
    _disconnect();
  }
}

final useRealtimeProvider = Provider<RealtimeClient>((ref) {
  ref.watch(realtimeLifecycleProvider);
  return ref.watch(realtimeProvider);
});
