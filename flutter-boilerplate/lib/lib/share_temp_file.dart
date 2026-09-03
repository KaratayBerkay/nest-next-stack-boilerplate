import 'dart:io';
import 'dart:math';

/// Writes [bytes] to a private throwaway file, hands its path to [share],
/// and removes the file (and its directory) again once the share sheet is
/// done — whether it succeeded, was dismissed, or threw. Decrypted message
/// attachments and MFA backup codes used to be left behind in the cache
/// directory indefinitely after sharing (MOB-044).
///
/// share_plus copies the file into its own staging area before launching
/// the platform sheet, so deleting once `share` returns never pulls the
/// rug from under the receiving app.
Future<void> shareBytesViaTempFile({
  required Directory baseDir,
  required String fileName,
  required List<int> bytes,
  required Future<void> Function(String path) share,
}) async {
  final dir = await Directory(
    '${baseDir.path}/share-${DateTime.now().microsecondsSinceEpoch}-'
    '${Random().nextInt(1 << 32)}',
  ).create(recursive: true);
  final file = File('${dir.path}/$fileName');
  try {
    await file.writeAsBytes(bytes, flush: true);
    await share(file.path);
  } finally {
    try {
      await dir.delete(recursive: true);
    } catch (_) {
      // Best effort — the directory is under the OS-managed cache anyway.
    }
  }
}

/// Reduces a display name that came from an untrusted source (another
/// user's upload metadata) to a single safe path segment, so a crafted name
/// can't escape the directory it is written into.
String safeShareFileName(String? name, {String fallback = 'attachment'}) {
  final raw = (name ?? '').trim();
  if (raw.isEmpty) return fallback;
  final segment = raw.split(RegExp(r'[/\\]')).last.trim();
  if (segment.isEmpty || segment == '.' || segment == '..') return fallback;
  return segment;
}
