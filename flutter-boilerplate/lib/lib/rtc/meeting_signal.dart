import 'package:flutter_boilerplate/lib/riverpod_compat.dart';

/// One-shot control events for a meeting room ('ended', 'removed', a
/// participant-joined toast, a duration warning) delivered over the shared
/// realtime WS. Kept separate from meetingChatProvider (an accumulating
/// list) since these are transient signals, not state to accumulate —
/// `seq` bumps on every emit so `ref.listen` fires even when two identical
/// events arrive back to back (e.g. two joins with the same name).
class MeetingSignal {
  final int seq;
  final String? joinedName;
  final bool ended;
  final bool removed;
  final int? warningSecondsRemaining;
  final bool forceMuted;

  const MeetingSignal({
    this.seq = 0,
    this.joinedName,
    this.ended = false,
    this.removed = false,
    this.warningSecondsRemaining,
    this.forceMuted = false,
  });
}

final meetingSignalProvider =
    StateNotifierProvider.family<MeetingSignalNotifier, MeetingSignal, String>(
  (ref, slug) => MeetingSignalNotifier(),
);

class MeetingSignalNotifier extends StateNotifier<MeetingSignal> {
  MeetingSignalNotifier() : super(const MeetingSignal());

  void participantJoined(String name) {
    state = MeetingSignal(seq: state.seq + 1, joinedName: name);
  }

  void ended() {
    state = MeetingSignal(seq: state.seq + 1, ended: true);
  }

  void removed() {
    state = MeetingSignal(seq: state.seq + 1, removed: true);
  }

  void warning(int secondsRemaining) {
    state = MeetingSignal(
      seq: state.seq + 1,
      warningSecondsRemaining: secondsRemaining,
    );
  }

  void forceMuted() {
    state = MeetingSignal(seq: state.seq + 1, forceMuted: true);
  }
}
