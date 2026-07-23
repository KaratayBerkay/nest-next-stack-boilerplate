import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/api_keys/list.dart';

final apiKeysProvider = FutureProvider((ref) async {
  final server = ref.read(apiKeyListServerProvider);
  return server.call();
});
