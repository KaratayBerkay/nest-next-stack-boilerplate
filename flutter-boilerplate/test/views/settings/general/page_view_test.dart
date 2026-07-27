import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/api/client/profile/query.dart';
import 'package:flutter_boilerplate/api/server/profile/get.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/views/settings/general/page_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

GoRouter _testRouter() => GoRouter(
      initialLocation: '/v1/en/settings/general',
      routes: [
        GoRoute(
          path: '/v1/en/settings/general',
          builder: (_, __) => const SettingsGeneralPageContent(lang: 'en'),
        ),
      ],
    );

Widget _wrapApp(GoRouter router) => MaterialApp.router(
      routerConfig: router,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: const [Locale('en'), Locale('tr')],
      theme: buildThemeData(AppThemeMode.light),
    );

void main() {
  group('SettingsGeneralPageContent async seeding', () {
    testWidgets(
      'seeds Timezone once the profile fetch resolves after first build',
      (tester) async {
        final completer = Completer<UserProfile>();

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              userProfileProvider.overrideWith((ref) => completer.future),
            ],
            child: _wrapApp(_testRouter()),
          ),
        );
        await tester.pump();

        // Profile hasn't resolved yet: must not crash, and must show the
        // unselected placeholder rather than silently caching a blank value.
        expect(find.text('Select timezone'), findsOneWidget);

        completer.complete(
          const UserProfile(
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
            timezone: 'Europe/Istanbul',
            tier: 'free',
          ),
        );
        await tester.pumpAndSettle();

        // Regression guard for T68: the already-mounted screen must adopt
        // the timezone once the async fetch completes, not stay blank.
        // (Both the subtitle and the now-matching dropdown value render it.)
        expect(find.text('Europe/Istanbul'), findsWidgets);
        expect(find.text('Select timezone'), findsNothing);
      },
    );

    testWidgets(
      'seeds Date display once SharedPreferences resolves after first build',
      (tester) async {
        SharedPreferences.setMockInitialValues({'date_display': 'ISO'});

        await tester.pumpWidget(
          ProviderScope(child: _wrapApp(_testRouter())),
        );
        await tester.pump();
        await tester.pumpAndSettle();

        // Regression guard for T69: the persisted value must be adopted
        // even though SharedPreferences resolves after initState runs.
        expect(find.text('ISO'), findsOneWidget);
      },
    );
  });
}
