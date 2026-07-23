import 'dart:math';

String formatPostContent(String text, int maxLines) {
  final lines = text.split('\n');
  if (lines.length <= maxLines) return text;
  return '${lines.take(maxLines).join('\n')}\n...';
}

String getRelativeTime(DateTime date) {
  final now = DateTime.now();
  final diff = now.difference(date);

  if (diff.inSeconds < 60) return 'just now';
  if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
  if (diff.inHours < 24) return '${diff.inHours}h ago';
  if (diff.inDays < 7) return '${diff.inDays}d ago';
  if (diff.inDays < 30) return '${diff.inDays ~/ 7}w ago';
  if (diff.inDays < 365) return '${diff.inDays ~/ 30}mo ago';
  return '${diff.inDays ~/ 365}y ago';
}

String truncateText(String text, int maxLength) {
  if (text.length <= maxLength) return text;
  return '${text.substring(0, maxLength)}...';
}
