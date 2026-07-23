import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../lib/realtime/realtime_client.dart';
import '../lib/realtime/realtime_provider.dart';
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
    client.registerServices(['MESSAGE', 'NOTIFICATION', 'chat', 'notifications', 'feed']);
    client.connect();
  }

  void _disconnect() {
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
