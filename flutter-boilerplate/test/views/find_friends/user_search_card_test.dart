import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/api/server/users/search.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/views/find_friends/user_search_card.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  const user = UserSearchResult(id: 'u1', name: 'Test User 1');

  Future<void> pumpCard(
    WidgetTester tester, {
    bool isPending = false,
    Future<void> Function()? onAdd,
  }) async {
    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: const [Locale('en'), Locale('tr')],
          theme: buildThemeData(AppThemeMode.light),
          home: Scaffold(
            body:
                UserSearchCard(user: user, isPending: isPending, onAdd: onAdd),
          ),
        ),
      ),
    );
    await tester.pump();
  }

  // Regression: the button previously fired sendRequest and forgot about
  // it — no loading state, no failure feedback, and a fast double-tap could
  // send two concurrent friend-request mutations.
  group('UserSearchCard add-friend flow', () {
    testWidgets('shows a disabled spinner while the request is in flight',
        (tester) async {
      final completer = Completer<void>();
      var callCount = 0;
      await pumpCard(
        tester,
        onAdd: () {
          callCount++;
          return completer.future;
        },
      );

      expect(find.text('Add Friend'), findsOneWidget);

      await tester.tap(find.text('Add Friend'));
      await tester.pump();

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Add Friend'), findsNothing);

      // A second tap while sending must not fire a second mutation.
      await tester.tap(find.byType(FilledButton), warnIfMissed: false);
      await tester.pump();
      expect(callCount, 1);

      completer.complete();
      await tester.pumpAndSettle();

      expect(find.text('Add Friend'), findsOneWidget);
      expect(find.byType(CircularProgressIndicator), findsNothing);
    });

    testWidgets('shows an error toast and resets when the request fails',
        (tester) async {
      await pumpCard(
        tester,
        onAdd: () => Future<void>.error(Exception('network blip')),
      );

      await tester.tap(find.text('Add Friend'));
      await tester.pumpAndSettle();

      expect(find.text('Failed to send friend request'), findsOneWidget);
      expect(find.text('Add Friend'), findsOneWidget);
    });

    testWidgets('shows a Pending label instead of a button when isPending',
        (tester) async {
      await pumpCard(tester, isPending: true, onAdd: () async {});

      expect(find.text('Pending'), findsOneWidget);
      expect(find.text('Add Friend'), findsNothing);
      expect(find.byType(FilledButton), findsNothing);
    });
  });
}
