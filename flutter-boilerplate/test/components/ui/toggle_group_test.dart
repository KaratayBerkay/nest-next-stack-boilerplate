import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/toggle_group/toggle_group.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('ToggleGroup renders all options', (tester) async {
    await pumpTestApp(
      tester,
      const ToggleGroup(
        options: ['A', 'B', 'C'],
        selectedIndexes: [0],
      ),
    );

    expect(find.text('A'), findsOneWidget);
    expect(find.text('B'), findsOneWidget);
    expect(find.text('C'), findsOneWidget);
  });

  testWidgets('ToggleGroup triggers onChanged on tap', (tester) async {
    List<int>? result;
    await pumpTestApp(
      tester,
      ToggleGroup(
        options: ['A', 'B'],
        selectedIndexes: [],
        onChanged: (v) => result = v,
      ),
    );

    await tester.tap(find.text('B'));
    expect(result, equals([1]));
  });
}
