import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/api/client/billing/query.dart';
import 'package:flutter_boilerplate/api/server/billing/address.dart';
import 'package:flutter_boilerplate/api/server/billing/history.dart';
import 'package:flutter_boilerplate/api/server/billing/payment_methods.dart';
import 'package:flutter_boilerplate/api/server/billing/subscription.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/views/settings/billing/page_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

class _FakeBillingAddressServer extends BillingAddressServer {
  _FakeBillingAddressServer() : super(Dio());

  @override
  Future<Map<String, dynamic>> get() async => {};

  @override
  Future<void> update(Map<String, dynamic> address) async {}
}

void main() {
  SubscriptionInfo makeSub({
    String plan = 'basic',
    String? pendingTier,
    DateTime? pendingTierEffectiveAt,
  }) {
    return SubscriptionInfo(
      plan: plan,
      status: 'active',
      pendingTier: pendingTier,
      pendingTierEffectiveAt: pendingTierEffectiveAt,
    );
  }

  Future<void> pumpCard(
    WidgetTester tester,
    SubscriptionInfo sub,
  ) async {
    final router = GoRouter(
      initialLocation: '/v1/en/settings/billing',
      routes: [
        GoRoute(
          path: '/v1/en/settings/billing',
          builder: (_, __) => const SettingsBillingPageContent(lang: 'en'),
        ),
      ],
    );
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          subscriptionProvider.overrideWith((ref) async => sub),
          paymentMethodsProvider.overrideWith((ref) async => <PaymentMethod>[]),
          billingHistoryProvider.overrideWith((ref) async => <Invoice>[]),
          billingAddressServerProvider
              .overrideWithValue(_FakeBillingAddressServer()),
        ],
        child: MaterialApp.router(
          routerConfig: router,
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: const [Locale('en'), Locale('tr')],
          theme: buildThemeData(AppThemeMode.light),
        ),
      ),
    );
    await tester.pump();
    await tester.pump();
  }

  group('_SubscriptionCard pending-change gating', () {
    testWidgets('shows Upgrade and Cancel as usual when no change is pending',
        (tester) async {
      await pumpCard(tester, makeSub());

      expect(find.text('Upgrade plan'), findsOneWidget);
      expect(find.text('Cancel subscription'), findsOneWidget);
      expect(find.textContaining('cancel that first'), findsNothing);
    });

    testWidgets('renders the pending-change notice and gates the buttons',
        (tester) async {
      await pumpCard(
        tester,
        makeSub(
          pendingTier: 'premium',
          pendingTierEffectiveAt: DateTime.utc(2026, 9, 15),
        ),
      );

      expect(
        find.textContaining('Your plan will change to Premium'),
        findsOneWidget,
      );
      expect(find.text('Upgrade plan'), findsNothing);
      expect(find.text('Cancel subscription'), findsNothing);
      expect(
        find.textContaining('cancel that first'),
        findsOneWidget,
      );
    });
  });
}
