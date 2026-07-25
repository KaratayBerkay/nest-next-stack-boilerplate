import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_boilerplate/lib/activity_logger.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final presenceProvider = StreamProvider<bool>((ref) {
  final connectivity = Connectivity();
  bool? previous;

  return connectivity.onConnectivityChanged.map(
    (results) {
      final current = results.any((r) => r != ConnectivityResult.none);

      if (previous != null && previous != current) {
        ActivityLogger.instance.enqueue({
          'category': 'network',
          'event': current ? 'network.online' : 'network.offline',
        });
      }

      previous = current;
      return current;
    },
  );
});

final isOnlineProvider = Provider<bool>((ref) {
  final asyncValue = ref.watch(presenceProvider);
  return asyncValue.asData?.value ?? true;
});
