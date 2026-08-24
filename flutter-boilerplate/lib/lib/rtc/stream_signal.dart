import 'package:flutter_boilerplate/lib/riverpod_compat.dart';

/// One-shot control events for a live-stream page ('ended', a viewer-count
/// change) delivered over the shared realtime WS — the stream analog of
/// MeetingSignal. `seq` bumps on every emit so `ref.listen` fires even when
/// two identical events arrive back to back.
class StreamSignal {
  final int seq;
  final bool ended;
  final int? viewerCount;

  const StreamSignal({this.seq = 0, this.ended = false, this.viewerCount});
}

final streamSignalProvider =
    StateNotifierProvider.family<StreamSignalNotifier, StreamSignal, String>(
  (ref, slug) => StreamSignalNotifier(),
);

class StreamSignalNotifier extends StateNotifier<StreamSignal> {
  StreamSignalNotifier() : super(const StreamSignal());

  void ended() {
    state = StreamSignal(seq: state.seq + 1, ended: true);
  }

  void viewerCountChanged(int count) {
    state = StreamSignal(seq: state.seq + 1, viewerCount: count);
  }
}
