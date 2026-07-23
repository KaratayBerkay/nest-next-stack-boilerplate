import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class ResponsiveGrid extends StatelessWidget {
  final List<Widget> children;
  final int columnsSm;
  final int columnsMd;
  final int columnsLg;
  final double gap;
  final double breakpointSm;
  final double breakpointMd;

  const ResponsiveGrid({
    super.key,
    required this.children,
    this.columnsSm = 1,
    this.columnsMd = 2,
    this.columnsLg = 3,
    this.gap = 16,
    this.breakpointSm = 600,
    this.breakpointMd = 900,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = _resolveColumns(constraints.maxWidth);
        final rows = _buildRows(columns);
        return Column(
          children: rows.map((row) => _buildRow(row, columns)).toList(),
        );
      },
    );
  }

  int _resolveColumns(double width) {
    if (width >= breakpointMd) return columnsLg;
    if (width >= breakpointSm) return columnsMd;
    return columnsSm;
  }

  List<List<Widget>> _buildRows(int columns) {
    final rows = <List<Widget>>[];
    for (var i = 0; i < children.length; i += columns) {
      rows.add(children.sublist(i, i + columns > children.length ? children.length : i + columns));
    }
    return rows;
  }

  Widget _buildRow(List<Widget> row, int columns) {
    return Padding(
      padding: EdgeInsets.only(bottom: gap),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (var i = 0; i < row.length; i++) ...[
            if (i > 0) SizedBox(width: gap),
            Expanded(
              flex: _flexForIndex(i, columns),
              child: row[i],
            ),
          ],
          if (row.length < columns)
            ...List.generate(
              columns - row.length,
              (_) => SizedBox(width: gap),
            ),
        ],
      ),
    );
  }

  int _flexForIndex(int index, int columns) {
    if (columns == 1) return 1;
    if (children.length % columns != 0 && index == columns - 1) {
      return columns;
    }
    return 1;
  }
}
