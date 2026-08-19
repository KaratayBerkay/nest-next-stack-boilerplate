import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/api/client/profile/actions.dart';
import 'package:flutter_boilerplate/api/client/profile/query.dart';
import 'package:flutter_boilerplate/api/server/profile/get.dart';
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

Widget _wrapApp(
  GoRouter router, {
  required AuthenticatedUser user,
  UserProfile? profile,
  ProfileActions Function(Ref ref)? actionsFactory,
}) =>
    ProviderScope(
      overrides: [
        currentUserProvider.overrideWith((ref) => user),
        // Always overridden with a concrete value, never left to hit the
        // real Dio-backed provider — same reasoning as the checkout tests'
        // planPricesProvider override: an unmocked FutureProvider in a
        // widget test is the wrong pattern regardless of whether it
        // happens to fail fast.
        userProfileProvider.overrideWith((ref) async => profile ?? _profile()),
        if (actionsFactory != null)
          profileActionsProvider.overrideWith(actionsFactory),
      ],
      child: MaterialApp.router(
        routerConfig: router,
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: const [Locale('en'), Locale('tr')],
        theme: buildThemeData(AppThemeMode.light),
      ),
    );

class _RecordingActions extends ProfileActions {
  final List<({String? chatNickname, bool? useNickname, bool? hideAvatar})>
      calls = [];

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
    bool? useNickname,
    bool? hideAvatar,
  }) async {
    calls.add(
      (
        chatNickname: chatNickname,
        useNickname: useNickname,
        hideAvatar: hideAvatar,
      ),
    );
  }
}

AuthenticatedUser _user({String? chatNickname}) => AuthenticatedUser(
      id: 'u1',
      email: 'a@b.com',
      name: 'Alice',
      tier: 'free',
      chatNickname: chatNickname,
    );

UserProfile _profile({bool useNickname = false, bool hideAvatar = false}) =>
    UserProfile(
      id: 'u1',
      name: 'Alice',
      email: 'a@b.com',
      tier: 'free',
      useNickname: useNickname,
      hideAvatar: hideAvatar,
    );

final _nicknameToggle = find.widgetWithText(
  SwitchListTile,
  'Go to chat rooms with nickname',
);

final _hideAvatarToggle = find.widgetWithText(
  SwitchListTile,
  "Don't show my profile picture",
);

void main() {
  group('SettingsPrivacyPageContent nickname persistence', () {
    testWidgets('seeds the toggle and field from the current user',
        (tester) async {
      await tester.pumpWidget(
        _wrapApp(
          _testRouter(),
          user: _user(chatNickname: 'Berk'),
          profile: _profile(useNickname: true),
        ),
      );
      await tester.pump();
      await tester.pump();

      expect(find.text('Berk'), findsOneWidget);
      expect(tester.widget<SwitchListTile>(_nicknameToggle).value, isTrue);
    });

    testWidgets('saves the nickname text and useNickname:true unchanged',
        (tester) async {
      late final _RecordingActions actions;

      await tester.pumpWidget(
        _wrapApp(
          _testRouter(),
          user: _user(chatNickname: 'Berk'),
          profile: _profile(useNickname: true),
          actionsFactory: (ref) => actions = _RecordingActions(ref),
        ),
      );
      await tester.pump();
      await tester.pump();

      await tester.tap(find.text('Save changes'));
      await tester.pumpAndSettle();

      expect(actions.calls, [
        (chatNickname: 'Berk', useNickname: true, hideAvatar: false),
      ]);
      expect(find.text('Profile updated'), findsOneWidget);
    });

    testWidgets(
        'turning the toggle off sends useNickname:false but keeps the '
        'saved nickname text (must not erase it — see the backend '
        'UpdateProfileInput.useNickname doc comment)', (tester) async {
      late final _RecordingActions actions;

      await tester.pumpWidget(
        _wrapApp(
          _testRouter(),
          user: _user(chatNickname: 'Berk'),
          profile: _profile(useNickname: true),
          actionsFactory: (ref) => actions = _RecordingActions(ref),
        ),
      );
      await tester.pump();
      await tester.pump();

      await tester.tap(_nicknameToggle);
      await tester.pump();
      await tester.tap(find.text('Save changes'));
      await tester.pumpAndSettle();

      expect(actions.calls, [
        (chatNickname: 'Berk', useNickname: false, hideAvatar: false),
      ]);
    });
  });

  group('SettingsPrivacyPageContent hideAvatar', () {
    testWidgets('seeds the toggle from userProfileProvider once it resolves',
        (tester) async {
      await tester.pumpWidget(
        _wrapApp(
          _testRouter(),
          user: _user(),
          profile: _profile(hideAvatar: true),
        ),
      );
      await tester.pump();
      await tester.pump();

      expect(tester.widget<SwitchListTile>(_hideAvatarToggle).value, isTrue);
    });

    testWidgets('sends the toggled value on save', (tester) async {
      late final _RecordingActions actions;

      await tester.pumpWidget(
        _wrapApp(
          _testRouter(),
          user: _user(),
          profile: _profile(),
          actionsFactory: (ref) => actions = _RecordingActions(ref),
        ),
      );
      await tester.pump();
      await tester.pump();

      await tester.tap(_hideAvatarToggle);
      await tester.pump();
      await tester.tap(find.text('Save changes'));
      await tester.pumpAndSettle();

      expect(actions.calls, [
        (chatNickname: '', useNickname: false, hideAvatar: true),
      ]);
    });
  });
}
