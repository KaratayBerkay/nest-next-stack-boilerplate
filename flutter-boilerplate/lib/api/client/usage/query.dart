import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/usage/messages.dart';
import '../../server/usage/storage.dart';

final storageUsageProvider = FutureProvider((ref) async {
  final server = ref.read(storageUsageServerProvider);
  return server.call();
});

final messageUsageProvider = FutureProvider((ref) async {
  final server = ref.read(messageUsageServerProvider);
  return server.call();
});
