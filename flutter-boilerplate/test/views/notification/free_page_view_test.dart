import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/api/client/notifications/actions.dart';
import 'package:flutter_boilerplate/api/server/notifications/list.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/types/notification/notification_item.dart';
import 'package:flutter_boilerplate/views/notification/free_page_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class _MockNotificationsServer extends Mock implements NotificationsServer {}

class _MockNotificationActions extends Mock implements NotificationActions {}

NotificationItem _item(String id, {required bool isRead}) => NotificationItem(
      id: id,
      type: 'COMMENT',
      title: 'Notification $id',
      body: 'body',
      isRead: isRead,
      createdAt: DateTime.utc(2026, 9, 2),
    );

void _stubPage(_MockNotificationsServer server, List<NotificationItem> items) {
  when(
    () => server.call(cursor: any(named: 'cursor'), take: any(named: 'take')),
  ).thenAnswer((_) async => NotificationsPage(items: items, hasMore: false));
}

Widget _app({
  required NotificationsServer server,
  required NotificationActions actions,
}) =>
    ProviderScope(
      overrides: [
        notificationsServerProvider.overrideWithValue(server),
        notificationActionsProvider.overrideWithValue(actions),
      ],
      child: MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: const [Locale('en'), Locale('tr')],
        theme: buildThemeData(AppThemeMode.light),
        home: const Scaffold(body: FreeNotificationPage(lang: 'en')),
      ),
    );

// CROSS-023: the web page auto-marks every notification read the first time
// it has any to show; mobile required an explicit tap, so the unread badge
// outlived a visit here. The page now mirrors the web's one-shot effect.
void main() {
  late _MockNotificationsServer server;
  late _MockNotificationActions actions;

  setUp(() {
    server = _MockNotificationsServer();
    actions = _MockNotificationActions();
    when(() => actions.markAllRead()).thenAnswer((_) async {});
  });

  testWidgets('marks all read once when unread notifications load',
      (tester) async {
    _stubPage(server, [_item('n1', isRead: false), _item('n2', isRead: true)]);

    await tester.pumpWidget(_app(server: server, actions: actions));
    await tester.pumpAndSettle();

    expect(find.text('Notification n1'), findsOneWidget);
    verify(() => actions.markAllRead()).called(1);
  });

  testWidgets('does not call markAllRead when everything is already read',
      (tester) async {
    _stubPage(server, [_item('n1', isRead: true)]);

    await tester.pumpWidget(_app(server: server, actions: actions));
    await tester.pumpAndSettle();

    verifyNever(() => actions.markAllRead());
  });

  testWidgets('does not call markAllRead on an empty inbox', (tester) async {
    _stubPage(server, const []);

    await tester.pumpWidget(_app(server: server, actions: actions));
    await tester.pumpAndSettle();

    verifyNever(() => actions.markAllRead());
  });
}
