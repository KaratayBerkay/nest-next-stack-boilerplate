import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

import 'package:flutter_boilerplate/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('UI demo pages', () {
    testWidgets('unauthenticated user is redirected from ui demo to login', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      expect(find.text('Login'), findsOneWidget);
      expect(find.text('Register'), findsOneWidget);
    });

    testWidgets('pricing page navigation works from home', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      await tester.tap(find.text('View Pricing'));
      await tester.pumpAndSettle();

      expect(find.text('Plans & Pricing'), findsWidgets);
    });

    testWidgets('about page shows architecture section', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      await tester.tap(find.text('About'));
      await tester.pumpAndSettle();

      expect(find.textContaining('Architecture'), findsWidgets);
    });
  });
}
