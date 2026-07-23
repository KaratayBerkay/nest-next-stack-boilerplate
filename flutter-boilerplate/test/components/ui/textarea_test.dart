import 'package:flutter_boilerplate/components/ui/textarea/textarea.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('renders with hint text', (tester) async {
    await pumpTestApp(
      tester,
      const Textarea(hintText: 'Enter description'),
    );

    expect(find.text('Enter description'), findsOneWidget);
  });
}
