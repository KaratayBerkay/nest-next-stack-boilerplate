import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/api/client/billing/query.dart';
import 'package:flutter_boilerplate/api/server/billing/plan_prices.dart';
import 'package:flutter_boilerplate/hooks/use_auth.dart';
import 'package:flutter_boilerplate/lib/tier.dart';
import 'package:flutter_boilerplate/views/plans/page_content.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  Future<void> pumpPlans(
    WidgetTester tester,
    String userTier, {
    List<PlanPrice> prices = const [],
  }) async {
    await pumpTestApp(
      tester,
      const PlansPageContent(lang: 'en'),
      overrides: [
        userTierProvider.overrideWithValue(userTier),
        planPricesProvider.overrideWith((ref) async => prices),
      ],
    );
  }

  group('PlansPageContent tier awareness', () {
    testWidgets(
        'free account: Free is the current plan, paid tiers are upgrades',
        (tester) async {
      await pumpPlans(tester, Tier.free);

      expect(find.text('Current Plan'), findsOneWidget);
      expect(find.text('Included'), findsNothing);
      expect(
        find.widgetWithText(FilledButton, 'Get Started'),
        findsNWidgets(2),
      );
      expect(find.widgetWithText(FilledButton, 'Subscribe'), findsOneWidget);
    });

    testWidgets(
        'medium account: Free/Basic are included, Medium is current, Premium is an upgrade',
        (tester) async {
      await pumpPlans(tester, Tier.medium);

      expect(find.text('Current Plan'), findsOneWidget);
      expect(find.text('Included'), findsNWidgets(2));
      expect(find.widgetWithText(FilledButton, 'Get Started'), findsNothing);
      expect(find.widgetWithText(FilledButton, 'Subscribe'), findsOneWidget);
    });

    testWidgets(
        'premium account: all lower tiers are included, nothing is an upgrade',
        (tester) async {
      await pumpPlans(tester, Tier.premium);

      expect(find.text('Current Plan'), findsOneWidget);
      expect(find.text('Included'), findsNWidgets(3));
      expect(find.widgetWithText(FilledButton, 'Get Started'), findsNothing);
      expect(find.widgetWithText(FilledButton, 'Subscribe'), findsNothing);
    });
  });

  group('PlansPageContent pricing', () {
    testWidgets(
        'shows the ARB placeholder prices before planPricesProvider resolves',
        (tester) async {
      await pumpPlans(tester, Tier.free);

      expect(find.text('\$0'), findsOneWidget);
      expect(find.text('\$9.99/mo'), findsOneWidget);
      expect(find.text('\$19.99/mo'), findsOneWidget);
      expect(find.text('\$49.99/mo'), findsOneWidget);
    });

    testWidgets(
        'renders live, currency-aware prices once planPricesProvider resolves',
        (tester) async {
      await pumpPlans(
        tester,
        Tier.free,
        prices: const [
          PlanPrice(tier: 'FREE', priceCents: 0, currency: 'EUR'),
          PlanPrice(tier: 'BASIC', priceCents: 599, currency: 'EUR'),
          PlanPrice(tier: 'MEDIUM', priceCents: 1499, currency: 'EUR'),
          PlanPrice(tier: 'PREMIUM', priceCents: 3999, currency: 'EUR'),
        ],
      );
      await tester.pumpAndSettle();

      // Real live prices, not the stale ARB-baked USD placeholders — proves
      // the planPrices query result actually reaches the rendered card
      // instead of the ARB pricingPriceX strings winning regardless.
      expect(find.text('\$9.99/mo'), findsNothing);
      expect(find.text('\$19.99/mo'), findsNothing);
      expect(find.text('\$49.99/mo'), findsNothing);
      expect(find.textContaining('5,99'), findsOneWidget);
      expect(find.textContaining('14,99'), findsOneWidget);
      expect(find.textContaining('39,99'), findsOneWidget);
    });
  });
}
