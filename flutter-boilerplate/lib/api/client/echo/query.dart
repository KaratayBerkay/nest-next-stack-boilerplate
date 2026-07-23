import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/echo/index.dart';

final echoQueryProvider = FutureProvider.family((ref, Map<String, dynamic> payload) async {
  final server = ref.read(echoServerProvider);
  return server.call(payload);
});
