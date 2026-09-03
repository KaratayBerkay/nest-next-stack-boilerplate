import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/api/server/messages/conversation_messages.dart';
import 'package:flutter_boilerplate/api/server/messages/delete_message.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/types/messages/message.dart';
import 'package:flutter_boilerplate/views/messages/chat_message_bubble.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockDeleteMessageServer extends Mock implements DeleteMessageServer {}

class MockConversationMessagesServer extends Mock
    implements ConversationMessagesServer {}

void main() {
  late MockDeleteMessageServer deleteServer;
  late MockConversationMessagesServer conversationServer;

  final message = ChatMessage(
    id: 'msg-1',
    conversationId: 'peer-1',
    senderId: 'me',
    senderName: 'Me',
    content: 'Hello',
    createdAt: DateTime(2026),
  );

  setUp(() {
    deleteServer = MockDeleteMessageServer();
    conversationServer = MockConversationMessagesServer();
    when(() => deleteServer.forMe(any())).thenAnswer((_) async {});
    when(
      () => conversationServer.call(
        any(),
        before: any(named: 'before'),
        take: any(named: 'take'),
      ),
    ).thenAnswer(
      (_) async => const ConversationMessagesPage(messages: [], hasMore: false),
    );
  });

  Future<void> pumpBubble(WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          deleteMessageServerProvider.overrideWithValue(deleteServer),
          conversationMessagesServerProvider
              .overrideWithValue(conversationServer),
        ],
        child: MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: const [Locale('en'), Locale('tr')],
          theme: buildThemeData(AppThemeMode.light),
          home: Scaffold(
            body: ChatMessageBubble(message: message, isMe: true),
          ),
        ),
      ),
    );
    await tester.pump();
  }

  // Regression (MOB-031): "delete for me" succeeded on the backend (the
  // MessageDeletion row was created immediately) but the message stayed
  // fully visible, unchanged, until the app was force-relaunched — nothing
  // ever told conversationMessagesProvider's cached list it was stale.
  // Fixed by having the actions layer refresh the relevant provider itself
  // (api/client/messages/actions.dart), mirroring the pre-existing
  // setFavorite -> conversationsProvider invalidation in that same file.
  // Before the fix, the delete flow never touched conversationMessagesProvider
  // at all (0 calls to the server below); after it, the provider is lazily
  // constructed (its own initial load) and then explicitly refreshed — 2
  // calls total, both for the 'peer-1' conversation.
  testWidgets('delete for me refreshes the conversation message list',
      (tester) async {
    await pumpBubble(tester);

    // ChatMessageBubble shrink-wraps to its bubble's content size (it isn't
    // stretched by the bare Scaffold(body: ...) this test uses), so
    // tester.longPress's computed center can land on a sibling Scaffold
    // render layer instead of the GestureDetector — invoking the callback
    // directly sidesteps that hit-test ambiguity entirely.
    final contextMenu = tester.widget<GestureDetector>(
      find.descendant(
        of: find.byType(ChatMessageBubble),
        matching: find.byType(GestureDetector),
      ),
    );
    contextMenu.onLongPress!();
    await tester.pumpAndSettle();
    await tester.tap(find.text('Delete for me'));
    await tester.pumpAndSettle();

    verify(() => deleteServer.forMe('msg-1')).called(1);
    verify(
      () => conversationServer.call(
        'peer-1',
        before: any(named: 'before'),
        take: any(named: 'take'),
      ),
    ).called(2);
  });
}
