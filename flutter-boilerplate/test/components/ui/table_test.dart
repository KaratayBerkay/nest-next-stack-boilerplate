import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/table/table.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('renders table with header', (tester) async {
    await pumpTestApp(
      tester,
      const TableWidget(
        children: [
          TableHeader(columns: ['Name', 'Email', 'Role']),
        ],
      ),
    );

    expect(find.text('Name'), findsOneWidget);
    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Role'), findsOneWidget);
  });

  testWidgets('renders table rows', (tester) async {
    await pumpTestApp(
      tester,
      const TableWidget(
        children: [
          TableHeader(columns: ['A', 'B']),
          TableRowWidget(
            cells: [
              TableCellWidget(child: Text('Row 1')),
              TableCellWidget(child: Text('Data 1')),
            ],
          ),
          TableRowWidget(
            cells: [
              TableCellWidget(child: Text('Row 2')),
              TableCellWidget(child: Text('Data 2')),
            ],
          ),
        ],
      ),
    );

    expect(find.text('Row 1'), findsOneWidget);
    expect(find.text('Data 2'), findsOneWidget);
  });

  testWidgets('renders table caption', (tester) async {
    await pumpTestApp(
      tester,
      const TableWidget(
        children: [
          TableCaption(text: 'Table caption'),
        ],
      ),
    );

    expect(find.text('Table caption'), findsOneWidget);
  });

  testWidgets('renders table footer', (tester) async {
    await pumpTestApp(
      tester,
      const TableWidget(
        children: [
          TableFooter(cells: [
            Text('Total'),
            Text('\$100'),
          ],),
        ],
      ),
    );

    expect(find.text('Total'), findsOneWidget);
    expect(find.text('\$100'), findsOneWidget);
  });
}
