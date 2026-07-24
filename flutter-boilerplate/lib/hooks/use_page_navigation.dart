import 'package:flutter_riverpod/flutter_riverpod.dart';

class NavEvent {
  final String from;
  final String to;
  final DateTime timestamp;

  NavEvent({
    required this.from,
    required this.to,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();
}

class NavHistoryState {
  final List<NavEvent> events;
  final String? lastLocation;

  const NavHistoryState({this.events = const [], this.lastLocation});

  NavHistoryState copyWith({List<NavEvent>? events, String? lastLocation}) {
    return NavHistoryState(
      events: events ?? this.events,
      lastLocation: lastLocation ?? this.lastLocation,
    );
  }
}

final navHistoryProvider =
    NotifierProvider<NavHistoryNotifier, NavHistoryState>(
  NavHistoryNotifier.new,
);

class NavHistoryNotifier extends Notifier<NavHistoryState> {
  @override
  NavHistoryState build() => const NavHistoryState();

  void record(String? from, String to) {
    state = NavHistoryState(
      events: [
        NavEvent(from: from ?? '', to: to),
        ...state.events,
      ].take(50).toList(),
      lastLocation: to,
    );
  }

  void clear() {
    state = const NavHistoryState();
  }

  void onLocationChanged(String newLocation) {
    record(state.lastLocation, newLocation);
  }
}
