import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/sessions/list.dart';

final sessionsProvider = FutureProvider((ref) async {
  final server = ref.read(sessionsListServerProvider);
  return server.call();
});
