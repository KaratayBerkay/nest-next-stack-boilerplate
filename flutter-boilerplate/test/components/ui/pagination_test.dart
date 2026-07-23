import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/pagination/pagination.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('renders page numbers', (tester) async {
    await pumpTestApp(
      tester,
      PaginationWidget(
        currentPage: 0,
        totalPages: 5,
        onPageChanged: (_) {},
      ),
    );
    for (int i = 1; i <= 5; i++) {
      expect(find.text('$i'), findsOneWidget);
    }
  });

  testWidgets('renders navigation buttons', (tester) async {
    await pumpTestApp(
      tester,
      PaginationWidget(
        currentPage: 0,
        totalPages: 5,
        onPageChanged: (_) {},
      ),
    );
    expect(find.byIcon(Icons.first_page), findsOneWidget);
    expect(find.byIcon(Icons.chevron_left), findsOneWidget);
    expect(find.byIcon(Icons.chevron_right), findsOneWidget);
    expect(find.byIcon(Icons.last_page), findsOneWidget);
  });

  testWidgets('hides first/last buttons when showFirstLast is false', (tester) async {
    await pumpTestApp(
      tester,
      PaginationWidget(
        currentPage: 0,
        totalPages: 5,
        onPageChanged: (_) {},
        showFirstLast: false,
      ),
    );
    expect(find.byIcon(Icons.first_page), findsNothing);
    expect(find.byIcon(Icons.last_page), findsNothing);
  });

  testWidgets('calls onPageChanged when page is tapped', (tester) async {
    int? selected;
    await pumpTestApp(
      tester,
      PaginationWidget(
        currentPage: 0,
        totalPages: 3,
        onPageChanged: (p) => selected = p,
      ),
    );
    await tester.tap(find.text('2'));
    expect(selected, 1);
  });

  testWidgets('does not navigate before first page', (tester) async {
    var changed = false;
    await pumpTestApp(
      tester,
      PaginationWidget(
        currentPage: 0,
        totalPages: 3,
        onPageChanged: (_) => changed = true,
      ),
    );
    await tester.tap(find.byIcon(Icons.chevron_left));
    expect(changed, isFalse);
  });

  testWidgets('does not navigate after last page', (tester) async {
    var changed = false;
    await pumpTestApp(
      tester,
      PaginationWidget(
        currentPage: 2,
        totalPages: 3,
        onPageChanged: (_) => changed = true,
      ),
    );
    await tester.tap(find.byIcon(Icons.chevron_right));
    expect(changed, isFalse);
  });
}
