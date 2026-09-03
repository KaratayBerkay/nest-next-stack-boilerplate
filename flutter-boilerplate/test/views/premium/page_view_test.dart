import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/hooks/use_auth.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/types/auth/user.dart';
import 'package:flutter_boilerplate/views/premium/page_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

void main() {
  // Regression (MOB-036): the free tier's only CTA, "View plans", was wired
  // to a literal empty closure (onPressed: () {}) — a dead no-op, not a
  // missed tap. Every sibling tier view in this file wires real behavior to
  // its buttons; only this one was left as a stub.
  testWidgets('free tier "View plans" button navigates to the plans route',
      (tester) async {
    final router = GoRouter(
      initialLocation: '/v1/en/premium',
      routes: [
        GoRoute(
          path: '/v1/:lang/premium',
          builder: (_, state) => PremiumPageContent(
            lang: state.pathParameters['lang'] ?? 'en',
          ),
        ),
        GoRoute(
          path: '/v1/:lang/plans',
          builder: (_, __) => const Scaffold(body: Text('Plans Page')),
        ),
      ],
    );

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          currentUserProvider.overrideWithValue(
            const AuthenticatedUser(
              id: 'me',
              email: 'me@berwallet.com',
              name: 'Me',
              tier: 'free',
            ),
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
    await tester.pumpAndSettle();

    expect(find.text('Plans Page'), findsNothing);
    await tester.tap(find.text('View plans'));
    await tester.pumpAndSettle();

    expect(find.text('Plans Page'), findsOneWidget);
  });
}
