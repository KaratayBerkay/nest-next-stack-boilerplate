import 'package:flutter_riverpod/flutter_riverpod.dart';

class NetworkLogEntry {
  final String method;
  final String path;
  final int statusCode;
  final int durationMs;
  final DateTime timestamp;

  NetworkLogEntry({
    required this.method,
    required this.path,
    required this.statusCode,
    required this.durationMs,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();
}

class NetworkLogState {
  final List<NetworkLogEntry> entries;

  const NetworkLogState({this.entries = const []});

  NetworkLogState copyWith({List<NetworkLogEntry>? entries}) {
    return NetworkLogState(entries: entries ?? this.entries);
  }
}

final networkLogsProvider =
    NotifierProvider<NetworkLogNotifier, NetworkLogState>(
  NetworkLogNotifier.new,
);

class NetworkLogNotifier extends Notifier<NetworkLogState> {
  @override
  NetworkLogState build() => const NetworkLogState();

  void add(NetworkLogEntry entry) {
    state = NetworkLogState(
      entries: [entry, ...state.entries].take(100).toList(),
    );
  }

  void clear() {
    state = const NetworkLogState();
  }
}
