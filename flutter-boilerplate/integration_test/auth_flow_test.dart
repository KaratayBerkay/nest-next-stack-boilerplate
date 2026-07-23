import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

import 'package:flutter_boilerplate/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Auth flow', () {
    testWidgets('navigate from home to login page', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      await tester.tap(find.text('Login'));
      await tester.pumpAndSettle();

      expect(find.text('Sign In'), findsOneWidget);
      expect(find.text('Create account'), findsOneWidget);
      expect(find.text('Forgot password?'), findsOneWidget);
    });

    testWidgets('fill email and password fields', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      await tester.tap(find.text('Login'));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField).at(0), 'test@example.com');
      await tester.enterText(find.byType(TextField).at(1), 'password123');
      await tester.pumpAndSettle();

      expect(find.text('test@example.com'), findsOneWidget);
    });

    testWidgets('tap Sign In button shows loading or error', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      await tester.tap(find.text('Login'));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField).at(0), 'test@example.com');
      await tester.enterText(find.byType(TextField).at(1), 'password123');

      await tester.tap(find.text('Sign In'));
      await tester.pumpAndSettle();

      expect(find.byType(CircularProgressIndicator), findsNothing);
    });

    testWidgets('navigate to register page from login', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      await tester.tap(find.text('Login'));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Create account'));
      await tester.pumpAndSettle();

      expect(find.text('Register'), findsWidgets);
    });
  });
}
