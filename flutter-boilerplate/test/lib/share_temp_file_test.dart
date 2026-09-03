import 'dart:io';

import 'package:flutter_boilerplate/lib/share_temp_file.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  late Directory base;

  setUp(() async {
    base = await Directory.systemTemp.createTemp('share-temp-test-');
  });

  tearDown(() async {
    if (await base.exists()) await base.delete(recursive: true);
  });

  group('shareBytesViaTempFile (MOB-044)', () {
    test('the file exists with the payload while sharing and is gone after',
        () async {
      String? seenPath;
      List<int>? seenBytes;

      await shareBytesViaTempFile(
        baseDir: base,
        fileName: 'backup-codes.txt',
        bytes: [1, 2, 3],
        share: (path) async {
          seenPath = path;
          seenBytes = await File(path).readAsBytes();
        },
      );

      expect(seenPath, endsWith('/backup-codes.txt'));
      expect(seenBytes, [1, 2, 3]);
      expect(File(seenPath!).existsSync(), isFalse);
      // Nothing else left behind either — the throwaway directory is gone.
      expect(base.listSync(), isEmpty);
    });

    test('cleans up even when the share sheet throws, and rethrows', () async {
      await expectLater(
        shareBytesViaTempFile(
          baseDir: base,
          fileName: 'attachment.bin',
          bytes: [9],
          share: (_) async => throw StateError('sheet dismissed'),
        ),
        throwsA(isA<StateError>()),
      );

      expect(base.listSync(), isEmpty);
    });

    test('concurrent shares never collide on the same path', () async {
      final paths = <String>[];
      await Future.wait([
        for (var i = 0; i < 3; i++)
          shareBytesViaTempFile(
            baseDir: base,
            fileName: 'same-name.txt',
            bytes: [i],
            share: (path) async => paths.add(path),
          ),
      ]);

      expect(paths.toSet(), hasLength(3));
    });
  });

  group('safeShareFileName', () {
    test('keeps an ordinary name', () {
      expect(safeShareFileName('report.pdf'), 'report.pdf');
    });

    test('strips directory components from a crafted sender-supplied name', () {
      expect(safeShareFileName('../../etc/passwd'), 'passwd');
      expect(safeShareFileName(r'C:\evil\..\x.txt'), 'x.txt');
    });

    test('falls back for empty, dot, and dot-dot names', () {
      expect(safeShareFileName(null), 'attachment');
      expect(safeShareFileName('   '), 'attachment');
      expect(safeShareFileName('..'), 'attachment');
      expect(safeShareFileName('a/..'), 'attachment');
      expect(safeShareFileName('', fallback: 'file'), 'file');
    });
  });
}
