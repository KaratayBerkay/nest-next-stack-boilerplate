import 'package:collection/collection.dart';

String formatAuditAction(String action) {
  return action
      .replaceAll(RegExp(r'[_-]'), ' ')
      .split(' ')
      .map((word) => word.isNotEmpty
          ? '${word[0].toUpperCase()}${word.substring(1).toLowerCase()}'
          : '',)
      .join(' ');
}

String formatAuditLevel(String level) {
  switch (level.toUpperCase()) {
    case 'INFO':
      return 'Info';
    case 'WARNING':
    case 'WARN':
      return 'Warning';
    case 'ERROR':
      return 'Error';
    case 'CRITICAL':
      return 'Critical';
    case 'DEBUG':
      return 'Debug';
    default:
      return level;
  }
}

List<String> extractDiffKeys(Map<String, dynamic> before, Map<String, dynamic> after) {
  final keys = <String>{};
  keys.addAll(before.keys);
  keys.addAll(after.keys);
  return keys.where((key) {
    final b = before[key];
    final a = after[key];
    return !_deepEqual(b, a);
  }).toList();
}

bool _deepEqual(dynamic a, dynamic b) {
  if (a is Map && b is Map) {
    return const DeepCollectionEquality().equals(a, b);
  }
  if (a is List && b is List) {
    return const DeepCollectionEquality().equals(a, b);
  }
  return a == b;
}
