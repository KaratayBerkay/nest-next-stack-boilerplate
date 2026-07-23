import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/posts/list.dart';
import '../../server/posts/single.dart';
import '../../server/posts/comments.dart';
import '../../server/posts/stats.dart';

final feedProvider = FutureProvider((ref) async {
  final server = ref.read(feedListServerProvider);
  return server.call();
});

final postProvider = FutureProvider.family((ref, String postId) async {
  final server = ref.read(postSingleServerProvider);
  return server.call(postId);
});

final postCommentsProvider = FutureProvider.family((ref, String postId) async {
  final server = ref.read(postCommentsServerProvider);
  return server.list(postId);
});

final postStatsProvider = FutureProvider((ref) async {
  final server = ref.read(postStatsServerProvider);
  return server.call();
});
