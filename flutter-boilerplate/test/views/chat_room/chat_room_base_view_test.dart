import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/api/server/messages/conversation_messages.dart';
import 'package:flutter_boilerplate/api/server/messages/room_messages.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_client.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_boilerplate/types/auth/user.dart';
import 'package:flutter_boilerplate/views/chat_room/chat_room_base_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/test/test_flutter_secure_storage_platform.dart';
import 'package:flutter_secure_storage_platform_interface/flutter_secure_storage_platform_interface.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockRealtimeClient extends Mock implements RealtimeClient {}

class MockRoomMessagesServer extends Mock implements RoomMessagesServer {}

class MockConversationMessagesServer extends Mock
    implements ConversationMessagesServer {}

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
  // MOB-032 regression: the real app reaches this screen through a
  // GoRouter ShellRoute, which nests its own Navigator below MaterialApp's
  // — a plain `home: Scaffold(...)` (the default below) has only one
  // Navigator, so it can't reproduce the wrong-BuildContext-pop defect that
  // hung the page-info dialog forever. See chat_room_base_view.dart's
  // onPageInfo and confirm_dialog_test.dart's matching nested-Navigator case.
  bool nestedNavigator = false,
}) {
  final client = mockClient ?? MockRealtimeClient();
  when(() => client.status).thenReturn(RealtimeStatus.idle);

  final roomServer = MockRoomMessagesServer();
  when(
    () => roomServer.call(
      any(),
      before: any(named: 'before'),
      take: any(named: 'take'),
    ),
  ).thenAnswer(
    (_) async =>
        const RoomMessagesPage(messages: testRoomMessages, hasMore: false),
  );

  final conversationServer = MockConversationMessagesServer();
  when(
    () => conversationServer.call(
      any(),
      before: any(named: 'before'),
      take: any(named: 'take'),
    ),
  ).thenAnswer(
    (_) async => const ConversationMessagesPage(messages: [], hasMore: false),
  );

  return ProviderScope(
    overrides: [
      realtimeProvider.overrideWith((ref) => client),
      realtimeConnectedProvider.overrideWith((ref) => true),
      roomMessagesServerProvider.overrideWithValue(roomServer),
      conversationMessagesServerProvider.overrideWithValue(conversationServer),
    ],
    child: MaterialApp(
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: const [Locale('en'), Locale('tr')],
      locale: const Locale('en'),
      theme: buildThemeData(AppThemeMode.light),
      home: nestedNavigator
          ? Navigator(
              onGenerateRoute: (settings) => MaterialPageRoute(
                builder: (context) => Scaffold(body: child),
              ),
            )
          : Scaffold(body: child),
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

    // MOB-016: this widget no longer doubles as a DM thread — an unknown
    // room name (the old legacy /chat/:peerId shape) lands on the default
    // room and still talks room-message, never direct-message.
    testWidgets('an unknown initialRoom falls back to the default room',
        (tester) async {
      final mockClient = MockRealtimeClient();
      when(() => mockClient.status).thenReturn(RealtimeStatus.idle);
      when(() => mockClient.send(any())).thenReturn(null);

      await tester.pumpWidget(
        buildTestApp(
          child: const ChatRoomBaseView(initialRoom: 'user-b'),
          mockClient: mockClient,
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('Chat Rooms'), findsAtLeast(1));
      // The room-counts request only ever went out for named rooms — its
      // presence proves the view is in named-room mode for the fallback.
      final sent = verify(() => mockClient.send(captureAny()))
          .captured
          .cast<Map<String, dynamic>>();
      expect(sent.any((f) => f['type'] == 'get-room-counts'), isTrue);
      expect(sent.any((f) => f['type'] == 'direct-message'), isFalse);
    });

    // Regression (MOB-032): tapping the page-info dialog's Close button used
    // to hang the whole screen on a solid black barrier under the real
    // app's nested (ShellRoute) Navigator — see buildTestApp's
    // nestedNavigator doc comment for why this needs its own harness shape.
    testWidgets(
        'page-info dialog Close button dismisses under a nested Navigator',
        (tester) async {
      await tester.pumpWidget(
        buildTestApp(
          child: const ChatRoomBaseView(showPageInfo: true),
          nestedNavigator: true,
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      await tester.tap(find.byIcon(Icons.info_outline));
      await tester.pump();
      expect(
        find.text('Real-time chat rooms with multiple topics.'),
        findsOneWidget,
      );

      await tester.tap(find.text('Close'));
      await tester.pump();
      expect(
        find.text('Real-time chat rooms with multiple topics.'),
        findsNothing,
      );
    });
  });
}
