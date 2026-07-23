import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/profile/get.dart';

final userProfileProvider = FutureProvider((ref) async {
  final server = ref.read(profileGetServerProvider);
  return server.call();
});
