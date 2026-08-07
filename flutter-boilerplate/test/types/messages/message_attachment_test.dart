import 'package:flutter_boilerplate/types/messages/message_attachment.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('StorageEnvelope.fromJson', () {
    test('parses a real backend response, which never includes ct', () {
      // The backend's toWireAttachment() (storage-crypto.service.ts)
      // deliberately omits `ct` — it can be megabytes and would blow past
      // the 64 KiB WS frame cap. This is what every real attachment
      // response actually looks like.
      final envelope = StorageEnvelope.fromJson({'v': 'v1', 'nonce': 'abc'});
      expect(envelope.v, 'v1');
      expect(envelope.nonce, 'abc');
    });
  });

  group('MessageAttachment.fromJson', () {
    test('parses an attachment with a storageEnvelope, without ct', () {
      final attachment = MessageAttachment.fromJson({
        'url': 'https://bucket.example.com/uploads/messages/u1/f.png',
        'type': 'image/png',
        'name': 'f.png',
        'size': 12345,
        'thumbnailUrl': 'https://bucket.example.com/uploads/thumb.png',
        'storageEnvelope': {'v': 'v1', 'nonce': 'abc'},
      });
      expect(attachment.url, isNotEmpty);
      expect(attachment.size, 12345);
      expect(attachment.thumbnailUrl, isNotNull);
      expect(attachment.storageEnvelope, isNotNull);
      expect(attachment.storageEnvelope!.v, 'v1');
    });

    test('parses an attachment with no storageEnvelope at all', () {
      final attachment = MessageAttachment.fromJson({
        'url': 'https://bucket.example.com/uploads/messages/u1/f.pdf',
        'type': 'application/pdf',
        'name': 'f.pdf',
      });
      expect(attachment.storageEnvelope, isNull);
      expect(attachment.size, 0);
      expect(attachment.thumbnailUrl, isNull);
    });
  });
}
