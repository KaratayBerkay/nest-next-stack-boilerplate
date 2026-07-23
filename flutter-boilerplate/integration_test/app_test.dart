import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

import 'package:flutter_boilerplate/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('App smoke test', () {
    testWidgets('app launches and renders MaterialApp', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      expect(find.byType(MaterialApp), findsOneWidget);
    });

    testWidgets('home page shows welcome text', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      expect(find.text('Flutter Boilerplate'), findsOneWidget);
      expect(find.text('Welcome to Flutter Boilerplate'), findsOneWidget);
    });

    testWidgets('home page has Login and Register buttons', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      expect(find.text('Login'), findsOneWidget);
      expect(find.text('Register'), findsOneWidget);
    });
  });
}
