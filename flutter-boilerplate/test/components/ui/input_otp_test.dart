import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/input_otp/input_otp.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('InputOtp renders digit fields', (tester) async {
    await pumpTestApp(
      tester,
      const InputOtp(length: 6),
    );

    expect(find.byType(TextField), findsNWidgets(6));
  });

  testWidgets('InputOtp fires onCompleted when all filled', (tester) async {
    String? result;
    await pumpTestApp(
      tester,
      InputOtp(length: 4, onCompleted: (v) => result = v),
    );

    final fields = find.byType(TextField);
    for (int i = 0; i < 4; i++) {
      await tester.enterText(fields.at(i), '${i + 1}');
    }

    expect(result, equals('1234'));
  });
}
