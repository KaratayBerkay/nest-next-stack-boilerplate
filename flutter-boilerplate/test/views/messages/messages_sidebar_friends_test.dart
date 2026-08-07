import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/api/client/friends/query.dart';
import 'package:flutter_boilerplate/api/server/messages/friends.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/hooks/use_messages_page.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_boilerplate/views/messages/messages_sidebar_friends.dart';
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
  group('MessagesSidebarFriends', () {
    testWidgets('renders friends with online status and opens a conversation',
        (tester) async {
      await tester.pumpWidget(
        _wrapApp(
          ProviderScope(
            overrides: [
              friendsListProvider.overrideWith(
                (ref) async => const [
                  Friend(
                    id: 'f1',
                    name: 'Alice',
                    email: 'alice@example.com',
                    isOnline: true,
                  ),
                  Friend(
                    id: 'f2',
                    name: 'Bob',
                    email: 'bob@example.com',
                    isOnline: false,
                  ),
                ],
              ),
              onlineUsersProvider.overrideWith((ref) => const {'f1'}),
            ],
            child: const MessagesSidebarFriends(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Alice'), findsOneWidget);
      expect(find.text('Bob'), findsOneWidget);
      expect(find.text('Online'), findsOneWidget);
      expect(find.text('Offline'), findsOneWidget);

      await tester.tap(find.text('Alice'));
      await tester.pump();

      final container = ProviderScope.containerOf(
        tester.element(find.byType(MessagesSidebarFriends)),
      );
      expect(
        container.read(selectedConversationUserIdProvider),
        'f1',
      );
    });

    testWidgets('filters friends by the search query', (tester) async {
      await tester.pumpWidget(
        _wrapApp(
          ProviderScope(
            overrides: [
              friendsListProvider.overrideWith(
                (ref) async => const [
                  Friend(
                    id: 'f1',
                    name: 'Alice',
                    email: 'alice@example.com',
                    isOnline: false,
                  ),
                  Friend(
                    id: 'f2',
                    name: 'Bob',
                    email: 'bob@example.com',
                    isOnline: false,
                  ),
                ],
              ),
            ],
            child: const MessagesSidebarFriends(searchQuery: 'ali'),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Alice'), findsOneWidget);
      expect(find.text('Bob'), findsNothing);
    });

    testWidgets('shows the empty state when there are no friends',
        (tester) async {
      await tester.pumpWidget(
        _wrapApp(
          ProviderScope(
            overrides: [
              friendsListProvider.overrideWith((ref) async => const []),
            ],
            child: const MessagesSidebarFriends(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('No friends yet. Find people to add!'), findsOneWidget);
    });
  });
}
