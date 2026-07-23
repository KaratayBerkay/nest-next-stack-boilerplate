import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/counter/counter.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('renders with value', (tester) async {
    await pumpTestApp(tester, const CounterWidget(value: 5));

    expect(find.text('5'), findsOneWidget);
  });

  testWidgets('increment and decrement buttons exist', (tester) async {
    await pumpTestApp(tester, const CounterWidget(value: 3));

    expect(find.byIcon(Icons.add), findsOneWidget);
    expect(find.byIcon(Icons.remove), findsOneWidget);
  });

  testWidgets('calls onChanged on button tap', (tester) async {
    var result = 0;
    await pumpTestApp(
      tester,
      CounterWidget(value: 5, onChanged: (v) => result = v),
    );

    await tester.tap(find.byIcon(Icons.add));
    await tester.pump();

    expect(result, 6);
  });
}
