import 'package:flutter_boilerplate/components/ui/badge/badge.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('Badge displays text', (tester) async {
    await pumpTestApp(tester, const Badge(text: 'New'));

    expect(find.text('New'), findsOneWidget);
  });

  testWidgets('Badge renders all variants', (tester) async {
    for (final variant in BadgeVariant.values) {
      await pumpTestApp(
        tester,
        Badge(text: variant.name, variant: variant),
      );
      expect(find.text(variant.name), findsOneWidget);
    }
  });
}
