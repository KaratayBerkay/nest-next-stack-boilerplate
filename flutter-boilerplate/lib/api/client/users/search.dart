import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/users/search.dart';

final searchUsersProvider = FutureProvider.family((ref, String query) async {
  final server = ref.read(usersSearchServerProvider);
  return server.call(query);
});
