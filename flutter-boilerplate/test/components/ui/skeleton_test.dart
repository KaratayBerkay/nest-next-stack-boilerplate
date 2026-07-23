import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/skeleton/skeleton.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('Skeleton renders with default size', (tester) async {
    await pumpTestApp(tester, const Skeleton());

    expect(find.byType(Skeleton), findsOneWidget);
  });

  testWidgets('Skeleton renders with custom size', (tester) async {
    await pumpTestApp(tester, const Skeleton(width: 100, height: 20));

    expect(find.byType(Skeleton), findsOneWidget);
  });
}
