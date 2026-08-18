import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/api/client/auth/actions.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/views/auth/verify_email/page_content.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockLoginActions extends Mock implements LoginActions {}

Widget buildTestApp({
  required Widget child,
  required MockLoginActions mockActions,
}) {
  return ProviderScope(
    overrides: [loginActionsProvider.overrideWith((ref) => mockActions)],
    child: MaterialApp(
      home: child,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: const [Locale('en'), Locale('tr')],
      theme: buildThemeData(AppThemeMode.light),
    ),
  );
}

void main() {
  late MockLoginActions mockActions;

  setUp(() {
    mockActions = MockLoginActions();
  });

  group('VerifyEmailPageContent token mode', () {
    testWidgets('verifies exactly once even across multiple rebuilds',
        (tester) async {
      when(() => mockActions.verifyEmail(any())).thenAnswer(
        (_) => Future<void>.delayed(const Duration(milliseconds: 50)),
      );

      await tester.pumpWidget(
        buildTestApp(
          child: const VerifyEmailPageContent(token: 'tok-123'),
          mockActions: mockActions,
        ),
      );

      // Regression guard: verifyWithToken() used to run inline in build(),
      // which reissues the single-use token on every rebuild (and, calling
      // setState() on this element's own build target, previously tripped
      // "setState() or markNeedsBuild() called during build"). None of these
      // extra pumps — all before the delayed mock resolves — should trigger
      // a second call.
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 10));
      await tester.pump(const Duration(milliseconds: 60));

      verify(() => mockActions.verifyEmail('tok-123')).called(1);
    });

    testWidgets('shows success view once verification resolves',
        (tester) async {
      when(() => mockActions.verifyEmail(any())).thenAnswer((_) async {});

      await tester.pumpWidget(
        buildTestApp(
          child: const VerifyEmailPageContent(token: 'tok-123'),
          mockActions: mockActions,
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byIcon(Icons.check_circle), findsOneWidget);
      verify(() => mockActions.verifyEmail('tok-123')).called(1);
    });

    testWidgets('shows the server error message on failure', (tester) async {
      when(() => mockActions.verifyEmail(any())).thenThrow(
        DioException(
          requestOptions: RequestOptions(path: '/api/auth/verify-email'),
          response: Response(
            requestOptions: RequestOptions(path: '/api/auth/verify-email'),
            statusCode: 400,
            data: {'msg': 'Token expired.'},
          ),
        ),
      );

      await tester.pumpWidget(
        buildTestApp(
          child: const VerifyEmailPageContent(token: 'tok-123'),
          mockActions: mockActions,
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Token expired.'), findsOneWidget);
    });
  });
}
