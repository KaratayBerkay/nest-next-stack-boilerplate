import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/security/nonce.dart';

final nonceProvider = FutureProvider((ref) async {
  final server = ref.read(nonceServerProvider);
  return server.call();
});
