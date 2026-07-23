import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/data/index.dart';

final dataQueryProvider = FutureProvider.family((ref, String key) async {
  final server = ref.read(dataServerProvider);
  return server.get(key);
});
