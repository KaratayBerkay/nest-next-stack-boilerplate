import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/tier_view.dart';
import 'package:flutter_test/flutter_test.dart';

import '../test_helpers.dart';

void main() {
  group('TierGate', () {
    testWidgets('shows free widget when not authenticated', (tester) async {
      await pumpTestApp(
        tester,
        const TierGate(
          freeWidget: Text('Free Content'),
        ),
      );

      expect(find.text('Free Content'), findsOneWidget);
    });

    testWidgets('shows upgrade prompt when tier not in allowed list',
        (tester) async {
      await pumpTestApp(
        tester,
        const TierGate(
          freeWidget: Text('Free Content'),
          allowedTiers: ['premium'],
        ),
      );

      expect(find.text('Free Content'), findsNothing);
      expect(find.textContaining('Upgrade'), findsOneWidget);
    });
  });
}
