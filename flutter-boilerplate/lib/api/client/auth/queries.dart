import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/auth/me.dart';

final currentUserProvider = FutureProvider((ref) async {
  final server = ref.read(meServerProvider);
  return server.call();
});
