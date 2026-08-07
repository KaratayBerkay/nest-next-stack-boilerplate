import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/api/client/usage/query.dart';
import 'package:flutter_boilerplate/api/server/usage/messages.dart';
import 'package:flutter_boilerplate/api/server/usage/storage.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/views/settings/usage/page_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

Future<void> _pump(
  WidgetTester tester, {
  required UploadStorageUsageResult storage,
  required MessageUsageResult messages,
}) async {
  final router = GoRouter(
    initialLocation: '/v1/en/settings/usage',
    routes: [
      GoRoute(
        path: '/v1/en/settings/usage',
        builder: (_, __) => const SettingsUsagePageContent(lang: 'en'),
      ),
    ],
  );
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        storageUsageProvider.overrideWith((ref) async => storage),
        messageUsageProvider.overrideWith((ref) async => messages),
      ],
      child: MaterialApp.router(
        routerConfig: router,
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: const [Locale('en'), Locale('tr')],
        theme: buildThemeData(AppThemeMode.light),
      ),
    ),
  );
  // Settle the width-dependent SettingsShellScaffold/SettingsNav frame plus
  // both usage FutureProviders resolving.
  await tester.pumpAndSettle();
}

void main() {
  group('SettingsUsagePageContent', () {
    testWidgets('renders both cards under their limits', (tester) async {
      await _pump(
        tester,
        storage: const UploadStorageUsageResult(
          bytes: 1024,
          fileCount: 2,
          limitBytes: 10240,
          tier: 'FREE',
          multiplier: 1,
        ),
        messages: const MessageUsageResult(
          letters: 100,
          bytes: 200,
          limitBytes: 2000,
          tier: 'FREE',
          multiplier: 1,
          from: '2026-08-01T00:00:00.000Z',
          to: '2026-08-08T00:00:00.000Z',
        ),
      );

      expect(find.text('Upload storage'), findsOneWidget);
      expect(find.text('Stored'), findsOneWidget);
      expect(
        find.textContaining('1.0 KB', findRichText: true),
        findsOneWidget,
      );
      expect(
        find.textContaining('200 B', findRichText: true),
        findsOneWidget,
      );
      expect(find.textContaining('2 files uploaded'), findsOneWidget);
      expect(find.textContaining('100 letters'), findsOneWidget);
      expect(
        find.text('You have reached your upload storage limit.'),
        findsNothing,
      );
      expect(
        find.text('You have reached your storage limit.'),
        findsNothing,
      );
    });

    testWidgets('shows the over-limit notice on both cards when exceeded',
        (tester) async {
      await _pump(
        tester,
        storage: const UploadStorageUsageResult(
          bytes: 10240,
          fileCount: 5,
          limitBytes: 10240,
          tier: 'FREE',
          multiplier: 1,
        ),
        messages: const MessageUsageResult(
          letters: 5000,
          bytes: 2000,
          limitBytes: 2000,
          tier: 'FREE',
          multiplier: 1,
          from: '2026-08-01T00:00:00.000Z',
          to: '2026-08-08T00:00:00.000Z',
        ),
      );

      expect(
        find.text('You have reached your upload storage limit.'),
        findsOneWidget,
      );
      expect(
        find.text('You have reached your storage limit.'),
        findsOneWidget,
      );
    });
  });
}
