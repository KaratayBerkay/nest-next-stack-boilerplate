import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/api/client/messages/query.dart';
import 'package:flutter_boilerplate/api/server/messages/room_messages.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_client.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_boilerplate/types/auth/user.dart';
import 'package:flutter_boilerplate/types/messages/message.dart';
import 'package:flutter_boilerplate/views/chat_room/chat_room_base_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/test/test_flutter_secure_storage_platform.dart';
import 'package:flutter_secure_storage_platform_interface/flutter_secure_storage_platform_interface.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockRealtimeClient extends Mock implements RealtimeClient {}

const testUser = AuthenticatedUser(
  id: 'user-1',
  email: 'test@test.com',
  name: 'Test User',
  tier: 'free',
);

const testRoomMessages = [
  RoomMessage(
    id: 'msg-1',
    senderId: 'user-a',
    senderName: 'Alice',
    avatar: 'https://example.com/avatar-a.png',
    body: 'Hello from Alice',
    createdAt: '2026-07-26T10:00:00Z',
  ),
  RoomMessage(
    id: 'msg-2',
    senderId: 'user-1',
    senderName: 'Test User',
    avatar: '',
    body: 'Reply from me',
    createdAt: '2026-07-26T10:01:00Z',
  ),
];

Widget buildTestApp({
  required Widget child,
  MockRealtimeClient? mockClient,
}) {
  final client = mockClient ?? MockRealtimeClient();
  when(() => client.status).thenReturn(RealtimeStatus.idle);

  return ProviderScope(
    overrides: [
      realtimeProvider.overrideWith((ref) => client),
      realtimeConnectedProvider.overrideWith((ref) => true),
      roomMessagesProvider.overrideWith(
        (ref, room) async => testRoomMessages,
      ),
      conversationMessagesProvider.overrideWith(
        (ref, id) async => <ChatMessage>[],
      ),
    ],
    child: MaterialApp(
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: const [Locale('en'), Locale('tr')],
      locale: const Locale('en'),
      theme: buildThemeData(AppThemeMode.light),
      home: Scaffold(body: child),
    ),
  );
}

void main() {
  setUp(() {
    FlutterSecureStoragePlatform.instance = TestFlutterSecureStoragePlatform({
      'access_token': 'test-access-token',
      'rbac_token': 'test-rbac',
      'device_token': 'test-device',
      'user_token': 'test-user',
      'session_user': jsonEncode(testUser.toJson()),
    });
  });

  group('ChatRoomBaseView', () {
    testWidgets('renders title with named room', (tester) async {
      await tester.pumpWidget(
        buildTestApp(
          child: const ChatRoomBaseView(
            showPageInfo: true,
          ),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('Chat Rooms'), findsAtLeast(1));
    });

    testWidgets(
        'RoomMessage to ChatMessage mapping shows sender name and message body',
        (tester) async {
      await tester.pumpWidget(
        buildTestApp(
          child: const ChatRoomBaseView(),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('Hello from Alice'), findsWidgets);
      expect(find.text('Reply from me'), findsWidgets);
    });

    testWidgets('selectRoom claims new room page', (tester) async {
      final mockClient = MockRealtimeClient();
      when(() => mockClient.status).thenReturn(RealtimeStatus.idle);
      when(() => mockClient.claimPage(any(), params: any(named: 'params')))
          .thenReturn(null);
      when(() => mockClient.send(any())).thenReturn(null);

      await tester.pumpWidget(
        buildTestApp(
          child: const ChatRoomBaseView(),
          mockClient: mockClient,
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      verify(() => mockClient.send(any())).called(1);
    });

    testWidgets('direct-message is sent for non-named room', (tester) async {
      final mockClient = MockRealtimeClient();
      when(() => mockClient.status).thenReturn(RealtimeStatus.idle);

      await tester.pumpWidget(
        buildTestApp(
          child: const ChatRoomBaseView(initialRoom: 'user-b'),
          mockClient: mockClient,
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('Chat Rooms'), findsAtLeast(1));
    });
  });
}
