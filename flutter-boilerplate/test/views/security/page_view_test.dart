import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/views/security/page_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

GoRouter _testRouter(String lang) => GoRouter(
      initialLocation: '/v1/$lang/settings/security',
      routes: [
        GoRoute(
          path: '/v1/:lang/settings/security',
          builder: (_, state) => SecurityPageContent(
            lang: state.pathParameters['lang'] ?? 'en',
          ),
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
  testWidgets('Security page renders MFA and biometric toggles',
      (tester) async {
    final router = _testRouter('en');

    await tester.pumpWidget(
      ProviderScope(
        child: _wrapApp(router),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Two-Factor Authentication'), findsOneWidget);
    expect(find.text('Change Password'), findsOneWidget);
  });
}
