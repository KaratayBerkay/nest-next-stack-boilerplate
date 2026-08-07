import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/chart/chart.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

List<ChartSeries> _series() => const [
      ChartSeries(label: 'Revenue', color: Colors.blue, values: [1, 2, 3]),
      ChartSeries(label: 'Expenses', color: Colors.grey, values: [4, 5, 6]),
    ];

void main() {
  for (final type in ChartType.values) {
    testWidgets('renders without error as a $type chart with a legend',
        (tester) async {
      await pumpTestApp(
        tester,
        Chart(type: type, xLabels: const ['A', 'B', 'C'], series: _series()),
      );
      await tester.pumpAndSettle();

      expect(tester.takeException(), isNull);
      expect(find.text('Revenue'), findsOneWidget);
      expect(find.text('Expenses'), findsOneWidget);
    });
  }

  testWidgets('does not divide by zero when every series is empty',
      (tester) async {
    await pumpTestApp(
      tester,
      const Chart(type: ChartType.line, xLabels: [], series: []),
    );
    await tester.pumpAndSettle();

    expect(tester.takeException(), isNull);
  });
}
