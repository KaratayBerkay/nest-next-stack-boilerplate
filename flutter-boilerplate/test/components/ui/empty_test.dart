import 'package:flutter_boilerplate/components/ui/empty/empty.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('EmptyWidget displays title', (tester) async {
    await pumpTestApp(tester, const EmptyWidget(title: 'No items'));

    expect(find.text('No items'), findsOneWidget);
  });

  testWidgets('EmptyWidget displays description when provided', (tester) async {
    await pumpTestApp(
      tester,
      const EmptyWidget(title: 'Empty', description: 'Nothing to show'),
    );

    expect(find.text('Nothing to show'), findsOneWidget);
  });
}
