import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/views/chat_room/chat_room_sidebar.dart';
import 'package:flutter_test/flutter_test.dart';

Widget _wrapApp(Widget child) => MaterialApp(
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: const [Locale('en'), Locale('tr')],
      theme: buildThemeData(AppThemeMode.light),
      home: Scaffold(body: SizedBox(width: 400, height: 600, child: child)),
    );
void noopSelect(String _) {}
void noopSetSidebar(bool _) {}

void main() {
  group('ChatRoomSidebar presence list', () {
    testWidgets('prefers the chat nickname over the real name', (tester) async {
      await tester.pumpWidget(
        _wrapApp(
          const ChatRoomSidebar(
            rooms: ['general'],
            room: 'general',
            currentUserId: 'u1',
            onSelectRoom: noopSelect,
            onSetSidebarOpen: noopSetSidebar,
            roomMembers: [
              {'userId': 'u1', 'name': 'Alice', 'chatNickname': 'Berk'},
              {'userId': 'u2', 'name': 'Bob'},
            ],
          ),
        ),
      );
      await tester.pump();
      await tester.tap(find.text('Online (0)'));
      await tester.pumpAndSettle();

      expect(find.text('Berk'), findsOneWidget);
      expect(find.text('Alice'), findsNothing);
      expect(find.text('Bob'), findsOneWidget);
    });

    testWidgets('shows the crown for the current user via userId',
        (tester) async {
      await tester.pumpWidget(
        _wrapApp(
          const ChatRoomSidebar(
            rooms: ['general'],
            room: 'general',
            currentUserId: 'u1',
            showSelfCrown: true,
            onSelectRoom: noopSelect,
            onSetSidebarOpen: noopSetSidebar,
            roomMembers: [
              {'userId': 'u1', 'name': 'Alice'},
              {'userId': 'u2', 'name': 'Bob'},
            ],
          ),
        ),
      );
      await tester.pump();
      await tester.tap(find.text('Online (0)'));
      await tester.pumpAndSettle();

      expect(find.byIcon(Icons.workspace_premium), findsOneWidget);
    });
  });
}
