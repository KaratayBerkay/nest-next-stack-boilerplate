import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/rtc/stream.dart';
import '../../server/rtc/streams_get.dart';
import '../../server/rtc/streams_list.dart';

final liveStreamsProvider = FutureProvider<List<LiveStream>>((ref) async {
  final server = ref.read(liveStreamsServerProvider);
  return server.call();
});

final streamBySlugProvider = FutureProvider.family<LiveStream?, String>((
  ref,
  slug,
) async {
  final server = ref.read(streamBySlugServerProvider);
  return server.call(slug);
});
