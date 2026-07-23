import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/main.dart' as app;
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Feed page', () {
    testWidgets('navigating to feed redirects to login when unauthenticated', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      expect(find.text('Login'), findsOneWidget);
    });

    testWidgets('feed page route shows auth gate when logged out', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      await tester.tap(find.text('Login'));
      await tester.pumpAndSettle();

      expect(find.text('Sign In'), findsOneWidget);
      expect(find.byType(TextField), findsNWidgets(2));
    });
  });
}
