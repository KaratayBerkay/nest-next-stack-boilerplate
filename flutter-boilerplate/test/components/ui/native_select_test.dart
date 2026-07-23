import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/native_select/native_select.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('renders with label', (tester) async {
    await pumpTestApp(
      tester,
      const NativeSelect(items: ['One', 'Two'], label: 'Number'),
    );
    expect(find.text('Number'), findsOneWidget);
  });

  testWidgets('renders with hintText', (tester) async {
    await pumpTestApp(
      tester,
      const NativeSelect(items: ['One', 'Two'], hintText: 'Pick one'),
    );
    expect(find.text('Pick one'), findsOneWidget);
  });

  testWidgets('renders with errorText', (tester) async {
    await pumpTestApp(
      tester,
      const NativeSelect(items: ['One', 'Two'], errorText: 'Required'),
    );
    expect(find.text('Required'), findsOneWidget);
  });

  testWidgets('renders all options', (tester) async {
    await pumpTestApp(
      tester,
      const NativeSelect(items: ['Option A', 'Option B', 'Option C']),
    );
    expect(find.byType(DropdownButtonFormField<String>), findsOneWidget);
  });

  testWidgets('handles onChanged', (tester) async {
    String? selected;
    await pumpTestApp(
      tester,
      NativeSelect(
        items: ['X', 'Y'],
        onChanged: (v) => selected = v,
      ),
    );
    await tester.tap(find.byType(DropdownButtonFormField<String>));
    await tester.pump();
    await tester.tap(find.text('Y').last);
    await tester.pump();
    expect(selected, 'Y');
  });
}
