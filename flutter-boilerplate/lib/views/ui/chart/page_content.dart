import 'package:flutter/material.dart';

import '../../../components/ui/chart/chart.dart';
import '../../../constants/theme.dart';

const _months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const _revenue = [4000.0, 3000.0, 9800.0, 3908.0, 4800.0, 3800.0];
const _expenses = [2400.0, 1398.0, 2000.0, 2780.0, 1890.0, 2390.0];

class ChartDemoPage extends StatelessWidget {
  final String lang;

  const ChartDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    List<ChartSeries> series() => [
          ChartSeries(label: 'Revenue', color: colors.brand, values: _revenue),
          ChartSeries(
            label: 'Expenses',
            color: colors.fgMuted,
            values: _expenses,
          ),
        ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          'Line Chart',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const Text('Track trends over time with lines.'),
        const SizedBox(height: 8),
        Chart(type: ChartType.line, xLabels: _months, series: series()),
        const SizedBox(height: 24),
        const Text(
          'Bar Chart',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const Text('Compare values across categories.'),
        const SizedBox(height: 8),
        Chart(type: ChartType.bar, xLabels: _months, series: series()),
        const SizedBox(height: 24),
        const Text(
          'Area Chart',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const Text('Show volume with filled areas.'),
        const SizedBox(height: 8),
        Chart(type: ChartType.area, xLabels: _months, series: series()),
      ],
    );
  }
}
