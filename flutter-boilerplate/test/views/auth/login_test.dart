import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_boilerplate/api/client/auth/actions.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/types/auth/auth_request_types.dart';
import 'package:flutter_boilerplate/types/auth/user.dart';
import 'package:flutter_boilerplate/views/auth/login/page_content.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/test/test_flutter_secure_storage_platform.dart';
import 'package:flutter_secure_storage_platform_interface/flutter_secure_storage_platform_interface.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:mocktail/mocktail.dart';

class MockLoginActions extends Mock implements LoginActions {}

Widget buildTestApp({
  required Widget child,
  Locale locale = const Locale('en'),
  MockLoginActions? mockActions,
}) {
  final router = GoRouter(
    initialLocation: '/auth/login',
    routes: [
      GoRoute(path: '/auth/login', builder: (_, __) => child),
      GoRoute(
        path: '/auth/forgot-password',
        builder: (_, __) => const SizedBox(),
      ),
      GoRoute(path: '/auth/register', builder: (_, __) => const SizedBox()),
      GoRoute(
        path: '/v1/en/feed',
        builder: (_, __) => const Text('Feed Page EN'),
      ),
      GoRoute(
        path: '/v1/tr/feed',
        builder: (_, __) => const Text('Feed Page TR'),
      ),
    ],
  );

  return ProviderScope(
    overrides: [
      if (mockActions != null)
        loginActionsProvider.overrideWith((ref) => mockActions),
    ],
    child: MaterialApp.router(
      routerConfig: router,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: const [Locale('en'), Locale('tr')],
      locale: locale,
      theme: buildThemeData(AppThemeMode.light),
    ),
  );
}

void main() {
  late MockLoginActions mockActions;

  setUpAll(() {
    registerFallbackValue(
      const LoginRequest(email: '', password: ''),
    );
  });

  const timezoneChannel = MethodChannel('flutter_timezone');

  setUp(() {
    mockActions = MockLoginActions();
    FlutterSecureStoragePlatform.instance =
        TestFlutterSecureStoragePlatform({});
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(
      timezoneChannel,
      (call) async => 'Europe/Istanbul',
    );
  });

  tearDown(() {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(timezoneChannel, null);
  });

  group('LoginPage', () {
    testWidgets('renders title, labels with asterisks, placeholder, links',
        (tester) async {
      await tester.pumpWidget(
        buildTestApp(
          child: const LoginPageContent(),
          mockActions: mockActions,
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Sign In'), findsAtLeast(1));
      expect(find.text('Email address'), findsOneWidget);
      expect(find.text('Password'), findsOneWidget);
      expect(find.text('you@example.com'), findsOneWidget);
      expect(find.text('Forgot password?'), findsOneWidget);
      expect(find.text("Don't have an account? Sign up"), findsOneWidget);
    });

    testWidgets('empty submit shows required errors, action never called',
        (tester) async {
      await tester.pumpWidget(
        buildTestApp(
          child: const LoginPageContent(),
          mockActions: mockActions,
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byType(ElevatedButton));
      await tester.pumpAndSettle();

      expect(find.text('Email is required'), findsOneWidget);
      expect(find.text('Password is required'), findsOneWidget);
      verifyNever(() => mockActions.login(any()));
    });

    testWidgets('invalid email shows email error', (tester) async {
      await tester.pumpWidget(
        buildTestApp(
          child: const LoginPageContent(),
          mockActions: mockActions,
        ),
      );
      await tester.pumpAndSettle();

      final textFields = find.byType(TextField);
      await tester.enterText(textFields.first, 'not-an-email');
      await tester.enterText(textFields.last, 'somepassword');

      await tester.tap(find.byType(ElevatedButton));
      await tester.pumpAndSettle();

      expect(find.text('Invalid email address'), findsOneWidget);
      verifyNever(() => mockActions.login(any()));
    });

    testWidgets('successful login navigates to feed', (tester) async {
      const testUser = AuthenticatedUser(
        id: '1',
        email: 'test@example.com',
        name: 'Test',
        tier: 'free',
      );

      when(() => mockActions.login(any())).thenAnswer(
        (_) async => LoginSuccess(
          const LoginResponse(
            accessToken: 'token123',
            rbacToken: 'rbac123',
            deviceToken: 'device123',
            userToken: 'user123',
            user: testUser,
          ),
        ),
      );

      await tester.pumpWidget(
        buildTestApp(
          child: const LoginPageContent(),
          mockActions: mockActions,
        ),
      );
      await tester.pumpAndSettle();

      final textFields = find.byType(TextField);
      await tester.enterText(textFields.first, 'test@example.com');
      await tester.enterText(textFields.last, 'correctpassword');

      await tester.tap(find.byType(ElevatedButton));
      await tester.pumpAndSettle();

      verify(() => mockActions.login(any())).called(1);
      expect(find.text('Feed Page EN'), findsOneWidget);
    });

    testWidgets('401 error shows form-level error', (tester) async {
      when(() => mockActions.login(any())).thenThrow(
        DioException(
          requestOptions: RequestOptions(path: '/api/auth/login'),
          response: Response(
            requestOptions: RequestOptions(path: '/api/auth/login'),
            statusCode: 401,
            data: {
              'msg': 'Invalid credentials. Please try again.',
              'key': 'auth.errors.loginFailed',
            },
          ),
        ),
      );

      await tester.pumpWidget(
        buildTestApp(
          child: const LoginPageContent(),
          mockActions: mockActions,
        ),
      );
      await tester.pumpAndSettle();

      final textFields = find.byType(TextField);
      await tester.enterText(textFields.first, 'test@example.com');
      await tester.enterText(textFields.last, 'wrongpassword');

      await tester.tap(find.byType(ElevatedButton));
      await tester.pumpAndSettle();

      expect(
        find.text('Invalid credentials. Please try again.'),
        findsOneWidget,
      );
      expect(find.text('Sign In'), findsAtLeast(1));
    });

    testWidgets('MFA flow renders challenge, validates code, verifies',
        (tester) async {
      // BE-033: the challenge response carries no user — the form must not
      // need one to render the code step. The user only arrives with the
      // real session from verifyLoginMfa below.
      const testUser = AuthenticatedUser(
        id: '1',
        email: 'test@example.com',
        name: 'Test',
        tier: 'free',
      );
      when(() => mockActions.login(any())).thenAnswer(
        (_) async => LoginMfaRequired(mfaToken: 'mfa-token-123'),
      );

      await tester.pumpWidget(
        buildTestApp(
          child: const LoginPageContent(),
          mockActions: mockActions,
        ),
      );
      await tester.pumpAndSettle();

      final textFields = find.byType(TextField);
      await tester.enterText(textFields.first, 'test@example.com');
      await tester.enterText(textFields.last, 'password');

      await tester.tap(find.byType(ElevatedButton));
      await tester.pumpAndSettle();

      expect(find.text('Two-Factor Authentication'), findsOneWidget);

      await tester.tap(find.text('Verify'));
      await tester.pumpAndSettle();

      expect(find.text('Enter your 6-digit code'), findsOneWidget);

      when(() => mockActions.verifyLoginMfa(any(), any())).thenAnswer(
        (_) async => {
          'accessToken': 'token-mfa',
          'rbacToken': 'rbac-mfa',
          'deviceToken': 'device-mfa',
          'userToken': 'user-mfa',
          'user': testUser.toJson(),
        },
      );

      final mfaFields = find.byType(TextField);
      for (var i = 0; i < 6; i++) {
        await tester.enterText(mfaFields.at(i), '${i + 1}');
      }

      await tester.tap(find.text('Verify'));
      await tester.pumpAndSettle();

      expect(find.text('Feed Page EN'), findsOneWidget);
    });

    testWidgets('tr locale renders Turkish text', (tester) async {
      await tester.pumpWidget(
        buildTestApp(
          child: const LoginPageContent(),
          mockActions: mockActions,
          locale: const Locale('tr'),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Giriş Yap'), findsAtLeast(1));
    });
  });
}
