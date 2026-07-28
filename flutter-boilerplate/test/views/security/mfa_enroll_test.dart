import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/api/client/auth/actions.dart';
import 'package:flutter_boilerplate/components/ui/input_otp/input_otp.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/types/auth/mfa_types.dart';
import 'package:flutter_boilerplate/views/security/mfa_enroll/page_content.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockLoginActions extends Mock implements LoginActions {}

Widget _wrapApp(Widget child) => ProviderScope(
      child: MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: const [Locale('en'), Locale('tr')],
        theme: buildThemeData(AppThemeMode.light),
        home: Scaffold(body: child),
      ),
    );

void main() {
  late MockLoginActions mockActions;

  setUp(() {
    mockActions = MockLoginActions();
  });

  testWidgets('MfaEnrollPageContent shows QR step on load', (tester) async {
    when(() => mockActions.enrollMfa()).thenAnswer(
      (_) async => const EnrollMfaResponse(
        otpauthUrl: 'otpauth://totp/test?secret=TEST123',
        secret: 'TEST123',
      ),
    );

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          loginActionsProvider.overrideWith((ref) => mockActions),
        ],
        child: _wrapApp(const MfaEnrollPageContent()),
      ),
    );

    await tester.pumpAndSettle();

    expect(
      find.text(
        'Use your authenticator app (e.g. Google Authenticator, Authy) to scan this QR code.',
      ),
      findsOneWidget,
    );
    expect(find.text('TEST123'), findsOneWidget);
  });

  testWidgets('MfaEnrollPageContent verify step uses InputOtp', (tester) async {
    when(() => mockActions.enrollMfa()).thenAnswer(
      (_) async => const EnrollMfaResponse(
        otpauthUrl: 'otpauth://totp/test?secret=TEST123',
        secret: 'TEST123',
      ),
    );

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          loginActionsProvider.overrideWith((ref) => mockActions),
        ],
        child: _wrapApp(const MfaEnrollPageContent()),
      ),
    );

    await tester.pumpAndSettle();

    await tester.tap(find.text('Continue'));
    await tester.pumpAndSettle();

    expect(find.byType(InputOtp), findsOneWidget);
  });
}
