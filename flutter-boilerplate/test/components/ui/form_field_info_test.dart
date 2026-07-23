import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/form_field_info/form_field_info.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('FormFieldInfo renders help text', (tester) async {
    await pumpTestApp(
      tester,
      const FormFieldInfo(text: 'Enter your full name'),
    );

    expect(find.text('Enter your full name'), findsOneWidget);
  });

  testWidgets('FormFieldInfo renders in error state', (tester) async {
    await pumpTestApp(
      tester,
      const FormFieldInfo(text: 'This field is required', isError: true),
    );

    expect(find.text('This field is required'), findsOneWidget);
  });
}
