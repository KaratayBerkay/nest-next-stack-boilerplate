import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/api/client/friends/query.dart';
import 'package:flutter_boilerplate/api/client/messages/query.dart';
import 'package:flutter_boilerplate/api/server/messages/friends.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_boilerplate/types/messages/conversation.dart';
import 'package:flutter_boilerplate/views/messages/chat_view_header.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

Widget _wrapApp(Widget child) => ProviderScope(
      child: MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: const [Locale('en'), Locale('tr')],
        theme: buildThemeData(AppThemeMode.light),
        home: Scaffold(body: child),
      ),
    );

void main() {
  group('ChatViewHeader name fallback', () {
    // Regression: `conversationsProvider` is built from message history, so
    // a brand-new friend you haven't messaged yet has no entry in it — the
    // header fell back straight to a hardcoded "Chat" title and a "C"
    // avatar initial instead of the friend's real name. Mirrors the web
    // header, which never has this gap because it's handed the selected
    // user's data directly rather than re-deriving it from conversations.
    testWidgets('falls back to the friend\'s name when no conversation exists',
        (tester) async {
      await tester.pumpWidget(
        _wrapApp(
          ProviderScope(
            overrides: [
              conversationsProvider.overrideWith((ref) async => const []),
              friendsListProvider.overrideWith(
                (ref) async => const [
                  Friend(
                    id: 'friend-1',
                    name: 'Test User 1',
                    email: 'test1@berwallet.com',
                    isOnline: true,
                  ),
                ],
              ),
              onlineUsersProvider.overrideWith((ref) => const {'friend-1'}),
            ],
            child: const ChatViewHeader(
              conversationId: 'friend-1',
              lang: 'en',
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Test User 1'), findsOneWidget);
      expect(find.text('Chat'), findsNothing);
    });

    testWidgets('prefers the conversation name when one exists',
        (tester) async {
      await tester.pumpWidget(
        _wrapApp(
          ProviderScope(
            overrides: [
              conversationsProvider.overrideWith(
                (ref) async => const [
                  Conversation(
                    id: 'friend-1',
                    userId: 'friend-1',
                    userName: 'Conversation Name',
                  ),
                ],
              ),
              friendsListProvider.overrideWith(
                (ref) async => const [
                  Friend(
                    id: 'friend-1',
                    name: 'Friend List Name',
                    email: 'test1@berwallet.com',
                    isOnline: false,
                  ),
                ],
              ),
              onlineUsersProvider.overrideWith((ref) => const <String>{}),
            ],
            child: const ChatViewHeader(
              conversationId: 'friend-1',
              lang: 'en',
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Conversation Name'), findsOneWidget);
      expect(find.text('Friend List Name'), findsNothing);
    });
  });
}
