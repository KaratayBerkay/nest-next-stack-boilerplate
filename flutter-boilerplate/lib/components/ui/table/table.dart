import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class TableWidget extends StatelessWidget {
  final List<Widget> children;

  const TableWidget({
    super.key,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border.all(color: colors.border),
        borderRadius: BorderRadius.circular(8),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: children,
        ),
      ),
    );
  }
}

class TableHeader extends StatelessWidget {
  final List<String> columns;

  const TableHeader({
    super.key,
    required this.columns,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return DecoratedBox(
      decoration: BoxDecoration(color: colors.surfaceAlt),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Row(
          children: columns.map((col) {
            return Expanded(
              child: Text(
                col,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: colors.fgMuted,
                  letterSpacing: 0.5,
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}

class TableRowWidget extends StatelessWidget {
  final List<Widget> cells;
  final VoidCallback? onTap;
  final bool selected;

  const TableRowWidget({
    super.key,
    required this.cells,
    this.onTap,
    this.selected = false,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return InkWell(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: selected ? colors.brand.withValues(alpha: 0.05) : null,
          border: Border(
            bottom: BorderSide(color: colors.border.withValues(alpha: 0.5)),
          ),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Row(
          children: cells.asMap().entries.map((entry) {
            return Expanded(
              child: DefaultTextStyle(
                style: TextStyle(fontSize: 13, color: colors.fg),
                child: entry.value,
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}

class TableCellWidget extends StatelessWidget {
  final Widget child;

  const TableCellWidget({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return child;
  }
}

class TableCaption extends StatelessWidget {
  final String text;

  const TableCaption({
    super.key,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Padding(
      padding: const EdgeInsets.only(top: 8, bottom: 4),
      child: Text(
        text,
        style: TextStyle(fontSize: 11, color: colors.fgMuted),
      ),
    );
  }
}

class TableFooter extends StatelessWidget {
  final List<Widget> cells;

  const TableFooter({
    super.key,
    required this.cells,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return DecoratedBox(
      decoration: BoxDecoration(color: colors.surfaceAlt),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Row(
          children: cells.asMap().entries.map((entry) {
            return Expanded(
              child: DefaultTextStyle(
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: colors.fg,
                ),
                child: entry.value,
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}
