import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/api/client/friends/query.dart';
import 'package:flutter_boilerplate/api/server/messages/friends.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/hooks/use_messages_page.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/views/friends/friends_page_content.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

GoRouter _buildRouter() => GoRouter(
      initialLocation: '/v1/en/friends',
      routes: [
        GoRoute(
          path: '/v1/en/friends',
          builder: (_, __) => const FriendsPageContent(lang: 'en'),
        ),
        GoRoute(
          path: '/v1/en/find-friends',
          builder: (_, __) => const Scaffold(body: Text('find-friends page')),
        ),
        GoRoute(
          path: '/v1/en/messages',
          builder: (_, __) => const Scaffold(body: Text('messages page')),
        ),
      ],
    );

void main() {
  group('FriendsPageContent', () {
    testWidgets('shows the empty state and navigates to find-friends',
        (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            friendsListProvider.overrideWith((ref) async => const []),
          ],
          child: MaterialApp.router(
            routerConfig: _buildRouter(),
            localizationsDelegates: AppLocalizations.localizationsDelegates,
            supportedLocales: const [Locale('en'), Locale('tr')],
            theme: buildThemeData(AppThemeMode.light),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('No friends yet'), findsOneWidget);
      expect(
        find.text('Find people to add as friends and start chatting.'),
        findsOneWidget,
      );

      await tester.tap(find.text('Find Friends'));
      await tester.pumpAndSettle();

      expect(find.text('find-friends page'), findsOneWidget);
    });

    testWidgets(
        'lists friends, hides the redundant email line, and opens a '
        'conversation on tap', (tester) async {
      await tester.pumpWidget(
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
                // No display name set server-side — Friend.fromJson falls
                // this back to the email, so name == email here.
                Friend(
                  id: 'f2',
                  name: 'bob@example.com',
                  email: 'bob@example.com',
                  isOnline: false,
                ),
              ],
            ),
          ],
          child: MaterialApp.router(
            routerConfig: _buildRouter(),
            localizationsDelegates: AppLocalizations.localizationsDelegates,
            supportedLocales: const [Locale('en'), Locale('tr')],
            theme: buildThemeData(AppThemeMode.light),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Alice'), findsOneWidget);
      expect(find.text('alice@example.com'), findsOneWidget);
      // Bob's name and email are identical (fallback case) — only one
      // instance of the text should render, not a redundant duplicate line.
      expect(find.text('bob@example.com'), findsOneWidget);
      expect(find.text('Message'), findsNWidgets(2));

      await tester.tap(find.text('Alice'));
      await tester.pumpAndSettle();

      final container = ProviderScope.containerOf(
        tester.element(find.text('messages page')),
      );
      expect(container.read(selectedConversationUserIdProvider), 'f1');
    });
  });
}
