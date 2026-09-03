import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/types/messages/friend_request_types.dart';
import 'package:flutter_boilerplate/views/find_friends/pending_request_card.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final request = FriendRequest(
    id: 'request-1',
    fromUserId: 'user-2',
    fromUserName: 'Test User 2',
    direction: 'incoming',
    createdAt: DateTime.now(),
  );

  Future<void> pumpCard(
    WidgetTester tester, {
    Future<void> Function()? onAccept,
    Future<void> Function()? onDecline,
  }) async {
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: const [Locale('en'), Locale('tr')],
        theme: buildThemeData(AppThemeMode.light),
        home: Scaffold(
          body: PendingRequestCard(
            request: request,
            onAccept: onAccept,
            onDecline: onDecline,
          ),
        ),
      ),
    );
    await tester.pump();
  }

  // Regression: accept/decline previously sent the friend-request's own id
  // to an endpoint expecting the *other user's* id, 404'd every time, and
  // the failure was swallowed silently — no busy state, no error, the row
  // just sat there looking unresponsive.
  group('PendingRequestCard accept/decline flow', () {
    testWidgets('accept calls the handler with feedback and no crash',
        (tester) async {
      final completer = Completer<void>();
      var acceptCalls = 0;
      await pumpCard(
        tester,
        onAccept: () {
          acceptCalls++;
          return completer.future;
        },
        onDecline: () async {},
      );

      await tester.tap(find.byIcon(Icons.check_circle));
      await tester.pump();

      expect(find.byType(CircularProgressIndicator), findsOneWidget);

      // Decline must be disabled while accept is in flight.
      await tester.tap(find.byIcon(Icons.cancel), warnIfMissed: false);
      await tester.pump();
      expect(acceptCalls, 1);

      completer.complete();
      await tester.pumpAndSettle();

      expect(find.byType(CircularProgressIndicator), findsNothing);
    });

    testWidgets('shows an error toast when accept fails', (tester) async {
      await pumpCard(
        tester,
        onAccept: () => Future<void>.error(Exception('404')),
        onDecline: () async {},
      );

      await tester.tap(find.byIcon(Icons.check_circle));
      await tester.pumpAndSettle();

      expect(find.text('Failed to accept friend request'), findsOneWidget);
    });

    testWidgets('shows an error toast when decline fails', (tester) async {
      await pumpCard(
        tester,
        onAccept: () async {},
        onDecline: () => Future<void>.error(Exception('404')),
      );

      await tester.tap(find.byIcon(Icons.cancel));
      await tester.pumpAndSettle();

      expect(find.text('Failed to decline friend request'), findsOneWidget);
    });
  });
}
