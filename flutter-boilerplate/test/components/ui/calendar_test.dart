import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/calendar/calendar.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('CalendarWidget renders month header', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: SingleChildScrollView(
            child: SizedBox(width: 400, child: CalendarWidget()),
          ),
        ),
      ),
    );
    await tester.pump();

    expect(find.byIcon(Icons.chevron_left), findsOneWidget);
    expect(find.byIcon(Icons.chevron_right), findsOneWidget);
  });

  testWidgets('CalendarWidget renders weekday labels', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: SingleChildScrollView(
            child: SizedBox(width: 400, child: CalendarWidget()),
          ),
        ),
      ),
    );
    await tester.pump();

    expect(find.text('Mon'), findsOneWidget);
    expect(find.text('Sun'), findsOneWidget);
  });

  testWidgets('CalendarWidget renders day cells', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: SingleChildScrollView(
            child: SizedBox(width: 400, child: CalendarWidget()),
          ),
        ),
      ),
    );
    await tester.pump();

    final dayCells = find.byType(InkWell);
    expect(dayCells, findsAtLeastNWidgets(1));
  });
}
