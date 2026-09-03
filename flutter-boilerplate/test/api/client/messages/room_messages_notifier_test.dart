import 'package:flutter_boilerplate/api/client/messages/query.dart';
import 'package:flutter_boilerplate/api/server/messages/room_messages.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class _MockRoomMessagesServer extends Mock implements RoomMessagesServer {}

RoomMessage _msg(String id, {String body = 'hi'}) => RoomMessage(
      id: id,
      senderId: 'u1',
      senderName: 'A',
      avatar: 'A',
      body: body,
      createdAt: '2026-09-03T10:00:00Z',
    );

// CROSS-024: chat rooms gained reply-to + delete; the room list notifier
// mirrors the web's ["room", slug] cache patches.
void main() {
  late _MockRoomMessagesServer server;

  setUp(() {
    server = _MockRoomMessagesServer();
    when(
      () => server.call(
        any(),
        before: any(named: 'before'),
        take: any(named: 'take'),
      ),
    ).thenAnswer(
      (_) async => RoomMessagesPage(
        messages: [_msg('m1', body: 'one'), _msg('m2', body: 'two')],
        hasMore: false,
      ),
    );
  });

  test('removeMessage drops the row (delete for me)', () async {
    final notifier = PaginatedRoomMessagesNotifier(server, 'general');
    await Future<void>.delayed(Duration.zero);
    notifier.removeMessage('m1');
    expect(notifier.state.items.map((m) => m.id), ['m2']);
    // Unknown ids are a no-op, not an error.
    notifier.removeMessage('nope');
    expect(notifier.state.items.length, 1);
  });

  test('markDeleted tombstones in place, keeping order and length', () async {
    final notifier = PaginatedRoomMessagesNotifier(server, 'general');
    await Future<void>.delayed(Duration.zero);
    notifier.markDeleted('m1', '2026-09-03T10:05:00Z');
    expect(notifier.state.items.map((m) => m.id), ['m1', 'm2']);
    final row = notifier.state.items.first;
    expect(row.deletedAt, '2026-09-03T10:05:00Z');
    expect(row.body, '');
    expect(row.attachments, isEmpty);
  });

  test('RoomMessage.fromJson reads the tombstone and the quoted author', () {
    final m = RoomMessage.fromJson({
      'id': 'm3',
      'senderId': 'u2',
      'senderName': 'Bea',
      'avatar': 'B',
      'createdAt': '2026-09-03T10:00:00Z',
      'deletedAt': '2026-09-03T10:05:00Z',
      'replyTo': {
        'id': 'm1',
        'senderId': 'u1',
        'senderName': 'Al',
        'body': 'lunch?',
        'deletedAt': null,
        'hasAttachments': false,
      },
    });
    expect(m.body, '');
    expect(m.deletedAt, '2026-09-03T10:05:00Z');
    expect(m.replyTo?.senderName, 'Al');
    expect(m.replyTo?.body, 'lunch?');
  });
}
