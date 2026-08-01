import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/hooks/use_auth.dart';
import 'package:flutter_boilerplate/hooks/use_billing.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/lib/tier.dart';
import 'package:flutter_boilerplate/views/checkout/checkout_success_view.dart';
import 'package:flutter_boilerplate/views/checkout/downgrade_section.dart';
import 'package:flutter_boilerplate/views/checkout/page_content.dart';
import 'package:flutter_boilerplate/views/checkout/stripe_card_form.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

class _FakeBillingState extends BillingState {
  _FakeBillingState(super.ref);

  final List<String> subscribeCalls = [];
  final List<int> setupIntentCalls = [];

  @override
  Future<Map<String, dynamic>> createSetupIntent() async {
    setupIntentCalls.add(1);
    return {'clientSecret': 'seti_test_secret_123'};
  }

  @override
  Future<Map<String, dynamic>> subscribe(String priceId) async {
    subscribeCalls.add(priceId);
    if (priceId == 'FREE') {
      return {'success': true, 'reason': 'canceled'};
    }
    return {
      'success': true,
      'pendingTier': 'PREMIUM',
      'pendingTierEffectiveAt': '2026-09-01T00:00:00Z',
    };
  }

  @override
  void invalidate() {}
}

void main() {
  late _FakeBillingState fake;

  Future<void> pumpCheckout(
    WidgetTester tester, {
    required String userTier,
    required String plan,
  }) async {
    final router = GoRouter(
      initialLocation: '/v1/en/checkout/$plan',
      routes: [
        GoRoute(
          path: '/v1/en/checkout/:tier',
          builder: (_, __) => CheckoutPageContent(lang: 'en', plan: plan),
        ),
        GoRoute(
          path: '/v1/en/settings/billing',
          builder: (_, __) => const Scaffold(body: Text('billing settings')),
        ),
      ],
    );
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          userTierProvider.overrideWithValue(userTier),
          billingStateProvider.overrideWith((ref) {
            fake = _FakeBillingState(ref);
            return fake;
          }),
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
    final context = tester.element(find.byType(CheckoutPageContent));
    fake = ProviderScope.containerOf(context).read(billingStateProvider)
        as _FakeBillingState;
  }

  group('CheckoutPageContent branches', () {
    testWidgets(
        'already on the target tier: summary card states it, no form or button',
        (tester) async {
      await pumpCheckout(tester, userTier: Tier.basic, plan: 'basic');

      expect(find.text('You are already on this plan.'), findsOneWidget);
      expect(find.byType(StripeCardFormField), findsNothing);
      expect(find.byType(DowngradeSection), findsNothing);
      expect(find.byType(FilledButton), findsNothing);
      expect(fake.subscribeCalls, isEmpty);
    });

    testWidgets('upgrade from free: pay button renders, no confirm section',
        (tester) async {
      await pumpCheckout(tester, userTier: Tier.free, plan: 'premium');

      expect(find.text('Upgrade — \$49.99/mo'), findsOneWidget);
      expect(find.byType(DowngradeSection), findsNothing);
      expect(find.text('Confirm change to Premium'), findsNothing);
      expect(fake.setupIntentCalls, isEmpty);
    });

    testWidgets(
        'upgrade from paid: confirm-change button, no card form; '
        'subscribe is called without a setup intent and success is scheduled',
        (tester) async {
      await pumpCheckout(tester, userTier: Tier.basic, plan: 'premium');

      expect(find.text('Confirm change to Premium'), findsOneWidget);
      expect(find.byType(StripeCardFormField), findsNothing);
      expect(
        find.textContaining('No charge today'),
        findsOneWidget,
      );

      await tester.tap(find.text('Confirm change to Premium'));
      await tester.pump();
      await tester.pump();

      expect(fake.subscribeCalls, ['PREMIUM']);
      expect(fake.setupIntentCalls, isEmpty);
      expect(find.byType(CheckoutSuccessView), findsOneWidget);
      expect(
        find.textContaining('will change to Premium on 2026-09-01'),
        findsOneWidget,
      );

      await tester.pump(const Duration(seconds: 6));
      await tester.pump();
      expect(find.text('billing settings'), findsOneWidget);
    });

    testWidgets(
        'downgrade: confirm-downgrade button subscribes to FREE and '
        'shows the downgrade success view', (tester) async {
      await pumpCheckout(tester, userTier: Tier.premium, plan: 'free');

      expect(find.text('Confirm downgrade to Free'), findsOneWidget);
      expect(find.byType(StripeCardFormField), findsNothing);

      await tester.tap(find.text('Confirm downgrade to Free'));
      await tester.pump();
      await tester.pump();

      expect(fake.subscribeCalls, ['FREE']);
      expect(fake.setupIntentCalls, isEmpty);
      expect(find.byType(CheckoutSuccessView), findsOneWidget);
      expect(find.text('Plan changed!'), findsOneWidget);

      await tester.pump(const Duration(seconds: 6));
      await tester.pump();
      expect(find.text('billing settings'), findsOneWidget);
    });
  });
}
