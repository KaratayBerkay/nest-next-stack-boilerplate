import 'package:flutter_riverpod/flutter_riverpod.dart';

class PerfEntry {
  final String label;
  final int durationMs;
  final DateTime timestamp;

  PerfEntry({
    required this.label,
    required this.durationMs,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();
}

class PerfLogState {
  final List<PerfEntry> entries;

  const PerfLogState({this.entries = const []});

  PerfLogState copyWith({List<PerfEntry>? entries}) {
    return PerfLogState(entries: entries ?? this.entries);
  }
}

final perfLogsProvider = NotifierProvider<PerfLogNotifier, PerfLogState>(
  PerfLogNotifier.new,
);

class PerfLogNotifier extends Notifier<PerfLogState> {
  @override
  PerfLogState build() => const PerfLogState();

  void log(String label, int durationMs) {
    final entry = PerfEntry(label: label, durationMs: durationMs);
    state = PerfLogState(
      entries: [entry, ...state.entries].take(50).toList(),
    );
  }

  void clear() {
    state = const PerfLogState();
  }
}

class PerfTimer {
  final String label;
  final Stopwatch _watch = Stopwatch();

  PerfTimer(this.label) {
    _watch.start();
  }

  void stop(WidgetRef ref) {
    _watch.stop();
    ref.read(perfLogsProvider.notifier).log(label, _watch.elapsedMilliseconds);
  }
}
