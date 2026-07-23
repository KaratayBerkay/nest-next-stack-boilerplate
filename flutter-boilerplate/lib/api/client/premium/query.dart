import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/premium/stats.dart';
import '../../server/premium/growth_stats.dart';

final premiumStatsProvider = FutureProvider((ref) async {
  final server = ref.read(premiumStatsServerProvider);
  return server.call();
});

final growthStatsProvider = FutureProvider((ref) async {
  final server = ref.read(growthStatsServerProvider);
  return server.call();
});
