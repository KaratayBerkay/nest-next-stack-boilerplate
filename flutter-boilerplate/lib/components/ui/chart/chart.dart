import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

enum ChartType { line, bar, area }

/// One data series (mirrors a single web `<Line dataKey="revenue" .../>` /
/// `<Bar dataKey="revenue" .../>` / `<Area dataKey="revenue" .../>` entry).
class ChartSeries {
  final String label;
  final Color color;
  final List<double> values;

  const ChartSeries({
    required this.label,
    required this.color,
    required this.values,
  });
}

/// Mirrors next-js-boilerplate's `components/ui/chart/chart.tsx` (Recharts
/// line/bar/area charts). Recharts composes `<XAxis>`/`<Line>`/etc. as JSX
/// children; fl_chart has no such compositional API, so this takes
/// [xLabels] + a flat [series] list instead of children — same feature set
/// (multi-series line/bar/area with axis labels and a legend), Dart-shaped
/// API.
class Chart extends StatelessWidget {
  final ChartType type;
  final List<String> xLabels;
  final List<ChartSeries> series;
  final double height;

  const Chart({
    super.key,
    required this.type,
    required this.xLabels,
    required this.series,
    this.height = 300,
  });

  double get _maxY {
    var max = 0.0;
    for (final s in series) {
      for (final v in s.values) {
        if (v > max) max = v;
      }
    }
    // Headroom above the tallest value so the topmost point/bar isn't
    // clipped against the chart's top edge.
    return max == 0 ? 1 : max * 1.2;
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return SizedBox(
      height: height,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(
            child: switch (type) {
              ChartType.bar => _buildBarChart(colors),
              ChartType.line || ChartType.area => _buildLineChart(colors),
            },
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 16,
            runSpacing: 4,
            alignment: WrapAlignment.center,
            children: [
              for (final s in series)
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: s.color,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      s.label,
                      style: TextStyle(fontSize: 12, color: colors.fgMuted),
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLineChart(AppColors colors) {
    return LineChart(
      LineChartData(
        minY: 0,
        maxY: _maxY,
        gridData: FlGridData(
          horizontalInterval: _maxY / 4,
          drawVerticalLine: false,
          getDrawingHorizontalLine: (_) =>
              FlLine(color: colors.border, strokeWidth: 1),
        ),
        borderData: FlBorderData(show: false),
        titlesData: _titlesData(colors),
        lineTouchData: LineTouchData(
          touchTooltipData: LineTouchTooltipData(
            getTooltipColor: (_) => colors.surfaceAlt,
          ),
        ),
        lineBarsData: [
          for (final s in series)
            LineChartBarData(
              spots: [
                for (var i = 0; i < s.values.length; i++)
                  FlSpot(i.toDouble(), s.values[i]),
              ],
              isCurved: true,
              color: s.color,
              dotData: const FlDotData(show: false),
              belowBarData: BarAreaData(
                show: type == ChartType.area,
                color: s.color.withValues(alpha: 0.15),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildBarChart(AppColors colors) {
    return BarChart(
      BarChartData(
        minY: 0,
        maxY: _maxY,
        gridData: FlGridData(
          horizontalInterval: _maxY / 4,
          drawVerticalLine: false,
          getDrawingHorizontalLine: (_) =>
              FlLine(color: colors.border, strokeWidth: 1),
        ),
        borderData: FlBorderData(show: false),
        titlesData: _titlesData(colors),
        barTouchData: BarTouchData(
          touchTooltipData: BarTouchTooltipData(
            getTooltipColor: (_) => colors.surfaceAlt,
          ),
        ),
        barGroups: [
          for (var i = 0; i < xLabels.length; i++)
            BarChartGroupData(
              x: i,
              barRods: [
                for (final s in series)
                  BarChartRodData(
                    toY: i < s.values.length ? s.values[i] : 0,
                    color: s.color,
                    width: 10,
                    borderRadius: BorderRadius.circular(2),
                  ),
              ],
            ),
        ],
      ),
    );
  }

  FlTitlesData _titlesData(AppColors colors) {
    return FlTitlesData(
      topTitles: const AxisTitles(),
      rightTitles: const AxisTitles(),
      leftTitles: AxisTitles(
        sideTitles: SideTitles(
          showTitles: true,
          reservedSize: 36,
          getTitlesWidget: (value, meta) => Text(
            value.toInt().toString(),
            style: TextStyle(fontSize: 10, color: colors.fgMuted),
          ),
        ),
      ),
      bottomTitles: AxisTitles(
        sideTitles: SideTitles(
          showTitles: true,
          getTitlesWidget: (value, meta) {
            final i = value.toInt();
            if (i < 0 || i >= xLabels.length) return const SizedBox.shrink();
            return Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                xLabels[i],
                style: TextStyle(fontSize: 10, color: colors.fgMuted),
              ),
            );
          },
        ),
      ),
    );
  }
}
