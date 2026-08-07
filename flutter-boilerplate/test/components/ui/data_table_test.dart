import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/data_table/data_table.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

class _Row {
  final String name;
  final int amount;
  const _Row(this.name, this.amount);
}

const _rows = [
  _Row('Carol', 300),
  _Row('Alice', 100),
  _Row('Bob', 200),
];

List<DataTableColumn<_Row>> _columns() => [
      DataTableColumn(
        header: 'Name',
        cellBuilder: (r) => Text(r.name),
        sortValue: (r) => r.name,
      ),
      DataTableColumn(
        header: 'Amount',
        cellBuilder: (r) => Text('${r.amount}'),
        sortValue: (r) => r.amount,
      ),
    ];

void main() {
  testWidgets('renders every row in its given order by default',
      (tester) async {
    await pumpTestApp(
      tester,
      AppDataTable<_Row>(columns: _columns(), data: _rows),
    );

    expect(find.text('Carol'), findsOneWidget);
    expect(find.text('Alice'), findsOneWidget);
    expect(find.text('Bob'), findsOneWidget);
  });

  testWidgets('sorts ascending then descending on repeated header taps',
      (tester) async {
    await pumpTestApp(
      tester,
      AppDataTable<_Row>(columns: _columns(), data: _rows),
    );

    await tester.tap(find.text('Name'));
    await tester.pumpAndSettle();

    Offset topOf(String text) => tester.getTopLeft(find.text(text));
    expect(topOf('Alice').dy, lessThan(topOf('Bob').dy));
    expect(topOf('Bob').dy, lessThan(topOf('Carol').dy));

    await tester.tap(find.text('Name'));
    await tester.pumpAndSettle();

    expect(topOf('Carol').dy, lessThan(topOf('Bob').dy));
    expect(topOf('Bob').dy, lessThan(topOf('Alice').dy));
  });

  testWidgets('filters rows by the search box against searchValue',
      (tester) async {
    await pumpTestApp(
      tester,
      AppDataTable<_Row>(
        columns: _columns(),
        data: _rows,
        searchValue: (r) => r.name,
      ),
    );

    await tester.enterText(find.byType(TextField), 'ali');
    await tester.pump();

    expect(find.text('Alice'), findsOneWidget);
    expect(find.text('Bob'), findsNothing);
    expect(find.text('Carol'), findsNothing);
  });

  testWidgets('shows "No results." when the filter matches nothing',
      (tester) async {
    await pumpTestApp(
      tester,
      AppDataTable<_Row>(
        columns: _columns(),
        data: _rows,
        searchValue: (r) => r.name,
      ),
    );

    await tester.enterText(find.byType(TextField), 'zzz');
    await tester.pump();

    expect(find.text('No results.'), findsOneWidget);
  });

  testWidgets('hides the search box entirely when searchValue is omitted',
      (tester) async {
    await pumpTestApp(
      tester,
      AppDataTable<_Row>(columns: _columns(), data: _rows),
    );

    expect(find.byType(TextField), findsNothing);
  });
}
