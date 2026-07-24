import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final presenceProvider = StreamProvider<bool>((ref) {
  final connectivity = Connectivity();
  return connectivity.onConnectivityChanged.map(
    (results) => results.any((r) => r != ConnectivityResult.none),
  );
});

final isOnlineProvider = Provider<bool>((ref) {
  final asyncValue = ref.watch(presenceProvider);
  return asyncValue.asData?.value ?? true;
});
