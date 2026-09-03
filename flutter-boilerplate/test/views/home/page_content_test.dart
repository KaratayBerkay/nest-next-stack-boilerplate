import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/constants/routes.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/views/home/page_content.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

GoRouter _buildRouter() => GoRouter(
      initialLocation: '/',
      routes: [
        GoRoute(path: '/', builder: (_, __) => const HomePageContent()),
        GoRoute(
          path: Routes.about,
          builder: (_, __) => const Scaffold(body: Text('about page')),
        ),
        GoRoute(
          path: '/pricing',
          builder: (_, __) => const Scaffold(body: Text('pricing page')),
        ),
      ],
    );

Widget _app() => ProviderScope(
      child: MaterialApp.router(
        routerConfig: _buildRouter(),
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: const [Locale('en'), Locale('tr')],
        theme: buildThemeData(AppThemeMode.light),
      ),
    );

// CROSS-038: the About page existed on both platforms but nothing in the
// app linked to it — the landing page is the Flutter twin of the web
// marketing header, so it carries both public links.
void main() {
  testWidgets('landing page links to About and navigates there',
      (tester) async {
    await tester.pumpWidget(_app());
    await tester.pumpAndSettle();

    expect(find.text('About'), findsOneWidget);
    await tester.tap(find.text('About'));
    await tester.pumpAndSettle();

    expect(find.text('about page'), findsOneWidget);
  });

  testWidgets('landing page still links to Pricing', (tester) async {
    await tester.pumpWidget(_app());
    await tester.pumpAndSettle();

    await tester.tap(find.text('View Pricing'));
    await tester.pumpAndSettle();

    expect(find.text('pricing page'), findsOneWidget);
  });
}
