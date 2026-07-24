import 'package:flutter_boilerplate/components/ui/switch/switch.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('SwitchWidget renders without label', (tester) async {
    await pumpTestApp(tester, const SwitchWidget(value: true));

    expect(find.byType(SwitchWidget), findsOneWidget);
  });

  testWidgets('SwitchWidget renders label when provided', (tester) async {
    await pumpTestApp(
      tester,
      const SwitchWidget(value: false, label: 'Notifications'),
    );

    expect(find.text('Notifications'), findsOneWidget);
  });

  testWidgets('SwitchWidget calls onChanged on tap', (tester) async {
    var toggled = false;
    await pumpTestApp(
      tester,
      SwitchWidget(value: false, onChanged: (v) => toggled = v),
    );

    await tester.tap(find.byType(SwitchWidget));
    expect(toggled, isTrue);
  });
}
