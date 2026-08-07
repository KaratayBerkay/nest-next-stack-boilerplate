import 'package:flutter/material.dart' hide DataTable, DataColumn, DataRow;
import 'package:flutter/material.dart' as material
    show DataTable, DataColumn, DataRow, DataCell;

import '../../../constants/theme.dart';

/// One column of an [AppDataTable]. Mirrors a single entry of web's
/// `ColumnDef<T>[]` (`@tanstack/react-table`) — [cellBuilder] stands in for
/// `cell`/`accessorKey`, [sortValue] for the value tanstack sorts by when a
/// column has no custom `cell`.
class DataTableColumn<T> {
  final String header;
  final Widget Function(T item) cellBuilder;
  final Comparable<dynamic> Function(T item)? sortValue;

  const DataTableColumn({
    required this.header,
    required this.cellBuilder,
    this.sortValue,
  });

  bool get sortable => sortValue != null;
}

/// Mirrors next-js-boilerplate's `components/ui/data-table/data-table.tsx` —
/// sortable, optionally-searchable table over generic row data. Built on
/// Flutter's own Material [material.DataTable] (native column-sort support)
/// rather than the unused custom `components/ui/table` primitives, matching
/// how this app's own (currently unrouted) `views/ui/table` demo already
/// uses Flutter's built-in DataTable directly.
class AppDataTable<T> extends StatefulWidget {
  final List<DataTableColumn<T>> columns;
  final List<T> data;
  final String Function(T item)? searchValue;
  final String searchPlaceholder;

  const AppDataTable({
    super.key,
    required this.columns,
    required this.data,
    this.searchValue,
    this.searchPlaceholder = 'Search...',
  });

  @override
  State<AppDataTable<T>> createState() => _AppDataTableState<T>();
}

class _AppDataTableState<T> extends State<AppDataTable<T>> {
  String _query = '';
  int? _sortColumnIndex;
  bool _sortAscending = true;

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    var rows = widget.searchValue == null || _query.isEmpty
        ? widget.data
        : widget.data
            .where(
              (item) => widget.searchValue!(item)
                  .toLowerCase()
                  .contains(_query.toLowerCase()),
            )
            .toList();

    if (_sortColumnIndex != null) {
      final sortValue = widget.columns[_sortColumnIndex!].sortValue!;
      rows = [...rows]..sort((a, b) {
          final cmp = sortValue(a).compareTo(sortValue(b));
          return _sortAscending ? cmp : -cmp;
        });
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.searchValue != null) ...[
          SizedBox(
            width: 280,
            child: TextField(
              decoration: InputDecoration(
                isDense: true,
                prefixIcon: const Icon(Icons.search, size: 18),
                hintText: widget.searchPlaceholder,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              onChanged: (v) => setState(() => _query = v),
            ),
          ),
          const SizedBox(height: 12),
        ],
        DecoratedBox(
          decoration: BoxDecoration(
            border: Border.all(color: colors.border),
            borderRadius: BorderRadius.circular(8),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: material.DataTable(
                sortColumnIndex: _sortColumnIndex,
                sortAscending: _sortAscending,
                columns: [
                  for (var i = 0; i < widget.columns.length; i++)
                    material.DataColumn(
                      label: Text(widget.columns[i].header),
                      onSort: widget.columns[i].sortable
                          ? (index, ascending) => setState(() {
                                _sortColumnIndex = index;
                                _sortAscending = ascending;
                              })
                          : null,
                    ),
                ],
                rows: rows.isEmpty
                    ? [
                        material.DataRow(
                          cells: [
                            material.DataCell(
                              Text(
                                'No results.',
                                style: TextStyle(color: colors.fgMuted),
                              ),
                            ),
                            for (var i = 1; i < widget.columns.length; i++)
                              const material.DataCell(SizedBox.shrink()),
                          ],
                        ),
                      ]
                    : [
                        for (final item in rows)
                          material.DataRow(
                            cells: [
                              for (final column in widget.columns)
                                material.DataCell(column.cellBuilder(item)),
                            ],
                          ),
                      ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
