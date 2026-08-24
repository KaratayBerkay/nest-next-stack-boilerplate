import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/rtc/meeting.dart';
import '../../server/rtc/meetings_get.dart';
import '../../server/rtc/meetings_list.dart';

final myMeetingsProvider = FutureProvider<List<Meeting>>((ref) async {
  final server = ref.read(myMeetingsServerProvider);
  return server.call();
});

final meetingBySlugProvider = FutureProvider.family<Meeting?, String>((
  ref,
  slug,
) async {
  final server = ref.read(meetingBySlugServerProvider);
  return server.call(slug);
});
