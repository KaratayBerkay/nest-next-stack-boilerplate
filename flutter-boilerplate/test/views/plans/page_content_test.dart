import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/hooks/use_auth.dart';
import 'package:flutter_boilerplate/lib/tier.dart';
import 'package:flutter_boilerplate/views/plans/page_content.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  Future<void> pumpPlans(WidgetTester tester, String userTier) async {
    await pumpTestApp(
      tester,
      const PlansPageContent(lang: 'en'),
      overrides: [userTierProvider.overrideWithValue(userTier)],
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
        'renders the real ARB-sourced prices, with cents, not the old flat-dollar strings',
        (tester) async {
      await pumpPlans(tester, Tier.free);

      expect(find.text('\$0'), findsOneWidget);
      expect(find.text('\$9.99/mo'), findsOneWidget);
      expect(find.text('\$19.99/mo'), findsOneWidget);
      expect(find.text('\$49.99/mo'), findsOneWidget);
      expect(find.text('\$9'), findsNothing);
      expect(find.text('\$19'), findsNothing);
      expect(find.text('\$49'), findsNothing);
    });
  });
}
