import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/separator/separator.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('Separator renders', (tester) async {
    await pumpTestApp(tester, const Separator());

    expect(find.byType(Separator), findsOneWidget);
  });
}
