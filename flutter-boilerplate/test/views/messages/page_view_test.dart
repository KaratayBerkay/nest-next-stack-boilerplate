import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/api/client/friends/query.dart';
import 'package:flutter_boilerplate/api/client/messages/query.dart';
import 'package:flutter_boilerplate/api/client/usage/query.dart';
import 'package:flutter_boilerplate/api/server/messages/conversation_messages.dart';
import 'package:flutter_boilerplate/api/server/messages/mark_read.dart';
import 'package:flutter_boilerplate/api/server/usage/messages.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/hooks/use_auth.dart';
import 'package:flutter_boilerplate/hooks/use_messages_page.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_boilerplate/types/auth/user.dart';
import 'package:flutter_boilerplate/views/messages/page_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

class _NoopMarkReadServer extends MarkReadServer {
  _NoopMarkReadServer() : super(Dio());

  @override
  Future<void> call(String userId) async {}
}

void main() {
  // Regression: opening Messages from a direct-message push notification
  // (MessagesPageContent(initialUser: ...)) crashed every time with "Tried
  // to modify a provider while the widget tree was building" — initState
  // set selectedConversationUserIdProvider synchronously, which Riverpod
  // forbids during a widget life-cycle method.
  testWidgets('deep-linking in with initialUser does not crash on build',
      (tester) async {
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    tester.view.physicalSize = const Size(400, 800);
    tester.view.devicePixelRatio = 1.0;

    final router = GoRouter(
      initialLocation: '/v1/en/messages',
      routes: [
        GoRoute(
          path: '/v1/en/messages',
          builder: (_, __) => const Scaffold(
            body: MessagesPageContent(
              lang: 'en',
              initialUser: 'friend-1',
            ),
          ),
        ),
      ],
    );

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          userTierProvider.overrideWithValue('free'),
          currentUserProvider.overrideWithValue(
            const AuthenticatedUser(
              id: 'me',
              email: 'me@berwallet.com',
              name: 'Me',
              tier: 'free',
            ),
          ),
          conversationsProvider.overrideWith((ref) async => const []),
          friendsListProvider.overrideWith((ref) async => const []),
          onlineUsersProvider.overrideWith((ref) => const <String>{}),
          typingUsersProvider.overrideWith((ref) => const {}),
          messageUsageProvider.overrideWith(
            (ref) async => const MessageUsageResult(
              letters: 0,
              bytes: 0,
              limitBytes: 1048576,
              tier: 'FREE',
              multiplier: 1,
              from: '2026-01-01',
              to: '2026-01-31',
            ),
          ),
          markReadServerProvider.overrideWithValue(_NoopMarkReadServer()),
          conversationMessagesServerProvider.overrideWithValue(
            _NoopConversationMessagesServer(),
          ),
        ],
        child: MaterialApp.router(
          routerConfig: router,
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: const [Locale('en'), Locale('tr')],
          theme: buildThemeData(AppThemeMode.light),
        ),
      ),
    );

    // The crash threw during the very first build/frame — pumping past it
    // without a FlutterError is the assertion. tester.takeException would
    // otherwise surface it via the default test error handler.
    await tester.pump();
    await tester.pump();

    final container = ProviderScope.containerOf(
      tester.element(find.byType(MessagesPageContent)),
    );
    expect(container.read(selectedConversationUserIdProvider), 'friend-1');
  });
}

class _NoopConversationMessagesServer extends ConversationMessagesServer {
  _NoopConversationMessagesServer() : super(Dio());

  @override
  Future<ConversationMessagesPage> call(
    String userId, {
    String? before,
    int take = 30,
  }) async {
    return const ConversationMessagesPage(messages: [], hasMore: false);
  }
}
