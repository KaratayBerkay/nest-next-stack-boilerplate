import 'package:flutter_boilerplate/components/ui/alert/alert.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('AlertWidget displays message', (tester) async {
    await pumpTestApp(tester, const AlertWidget(message: 'Something happened'));

    expect(find.text('Something happened'), findsOneWidget);
  });

  testWidgets('AlertWidget displays title when provided', (tester) async {
    await pumpTestApp(
      tester,
      const AlertWidget(title: 'Notice', message: 'Please update'),
    );

    expect(find.text('Notice'), findsOneWidget);
    expect(find.text('Please update'), findsOneWidget);
  });

  testWidgets('AlertWidget renders all variants', (tester) async {
    for (final variant in AlertVariant.values) {
      await pumpTestApp(
        tester,
        AlertWidget(message: 'Test ${variant.name}', variant: variant),
      );
      expect(find.text('Test ${variant.name}'), findsOneWidget);
    }
  });
}
