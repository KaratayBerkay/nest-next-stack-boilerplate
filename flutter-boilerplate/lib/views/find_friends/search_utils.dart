import 'dart:async';

import 'package:flutter/foundation.dart';

List<T> filterByQuery<T>(
  List<T> items,
  String query,
  String Function(T) toField,
) {
  if (query.isEmpty) return items;
  final lower = query.toLowerCase();
  return items
      .where((item) => toField(item).toLowerCase().contains(lower))
      .toList();
}

class Debouncer {
  final Duration delay;
  Timer? _timer;

  Debouncer({this.delay = const Duration(milliseconds: 300)});

  void call(VoidCallback action) {
    _timer?.cancel();
    _timer = Timer(delay, action);
  }

  void cancel() {
    _timer?.cancel();
  }

  void dispose() {
    cancel();
  }
}

String highlightMatch(String text, String query) {
  if (query.isEmpty) return text;
  final lower = text.toLowerCase();
  final queryLower = query.toLowerCase();
  final idx = lower.indexOf(queryLower);
  if (idx == -1) return text;
  return text;
}
