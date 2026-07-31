import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/api/client/profile/actions.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/hooks/use_auth.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/types/auth/user.dart';
import 'package:flutter_boilerplate/views/settings/privacy/page_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

GoRouter _testRouter() => GoRouter(
      initialLocation: '/v1/en/settings/privacy',
      routes: [
        GoRoute(
          path: '/v1/en/settings/privacy',
          builder: (_, __) =>
              const Scaffold(body: SettingsPrivacyPageContent(lang: 'en')),
        ),
      ],
    );

Widget _wrapApp(GoRouter router) => MaterialApp.router(
      routerConfig: router,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: const [Locale('en'), Locale('tr')],
      theme: buildThemeData(AppThemeMode.light),
    );

class _RecordingActions extends ProfileActions {
  final List<String?> calls = [];

  _RecordingActions(super.ref);

  @override
  Future<void> update({
    String? name,
    String? bio,
    String? username,
    String? avatarUrl,
    String? locale,
    String? timezone,
    String? chatNickname,
  }) async {
    calls.add(chatNickname);
  }
}

AuthenticatedUser _user({String? chatNickname}) => AuthenticatedUser(
      id: 'u1',
      email: 'a@b.com',
      name: 'Alice',
      tier: 'free',
      chatNickname: chatNickname,
    );

final _nicknameToggle = find.widgetWithText(
  SwitchListTile,
  'Go to chat rooms with nickname',
);

void main() {
  group('SettingsPrivacyPageContent nickname persistence', () {
    testWidgets('seeds the toggle and field from the current user',
        (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            currentUserProvider
                .overrideWith((ref) => _user(chatNickname: 'Berk')),
          ],
          child: _wrapApp(_testRouter()),
        ),
      );
      await tester.pump();

      expect(find.text('Berk'), findsOneWidget);
      expect(tester.widget<SwitchListTile>(_nicknameToggle).value, isTrue);
    });

    testWidgets('saves the nickname when enabled and non-empty',
        (tester) async {
      late final _RecordingActions actions;

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            currentUserProvider
                .overrideWith((ref) => _user(chatNickname: 'Berk')),
            profileActionsProvider
                .overrideWith((ref) => actions = _RecordingActions(ref)),
          ],
          child: _wrapApp(_testRouter()),
        ),
      );
      await tester.pump();

      await tester.tap(find.text('Save changes'));
      await tester.pumpAndSettle();

      expect(actions.calls, ['Berk']);
      expect(find.text('Profile updated'), findsOneWidget);
    });

    testWidgets('clears the nickname when the toggle is off', (tester) async {
      late final _RecordingActions actions;

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            currentUserProvider
                .overrideWith((ref) => _user(chatNickname: 'Berk')),
            profileActionsProvider
                .overrideWith((ref) => actions = _RecordingActions(ref)),
          ],
          child: _wrapApp(_testRouter()),
        ),
      );
      await tester.pump();

      await tester.tap(_nicknameToggle);
      await tester.pump();
      await tester.tap(find.text('Save changes'));
      await tester.pumpAndSettle();

      expect(actions.calls, ['']);
    });
  });
}
