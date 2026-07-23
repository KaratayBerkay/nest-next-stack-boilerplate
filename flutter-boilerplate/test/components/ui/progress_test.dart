import 'package:flutter_boilerplate/components/ui/progress/progress.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('ProgressWidget renders with value', (tester) async {
    await pumpTestApp(tester, const ProgressWidget(value: 0.5));

    expect(find.byType(ProgressWidget), findsOneWidget);
  });

  testWidgets('ProgressWidget renders indeterminate', (tester) async {
    await pumpTestApp(tester, const ProgressWidget());

    expect(find.byType(ProgressWidget), findsOneWidget);
  });
}
