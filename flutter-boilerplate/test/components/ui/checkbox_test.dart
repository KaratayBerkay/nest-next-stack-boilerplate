import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/checkbox/checkbox.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('CheckboxWidget renders without label', (tester) async {
    await pumpTestApp(tester, const CheckboxWidget(value: true));

    expect(find.byType(CheckboxWidget), findsOneWidget);
  });

  testWidgets('CheckboxWidget renders label when provided', (tester) async {
    await pumpTestApp(tester, const CheckboxWidget(value: false, label: 'Agree'));

    expect(find.text('Agree'), findsOneWidget);
  });

  testWidgets('CheckboxWidget calls onChanged on tap', (tester) async {
    var toggled = false;
    await pumpTestApp(tester, CheckboxWidget(value: false, onChanged: (v) => toggled = v));

    await tester.tap(find.byType(CheckboxWidget));
    expect(toggled, isTrue);
  });
}
