import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/input_otp/input_otp.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('InputOtp renders digit fields', (tester) async {
    await pumpTestApp(tester, const InputOtp());
    expect(find.byType(TextField), findsNWidgets(6));
  });

  testWidgets('InputOtp calls onChanged on keystroke', (tester) async {
    String? current;
    await pumpTestApp(
      tester,
      InputOtp(onChanged: (v) => current = v),
    );

    await tester.enterText(find.byType(TextField).at(0), '1');
    expect(current, equals('1'));

    await tester.enterText(find.byType(TextField).at(1), '2');
    expect(current, equals('12'));
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

  testWidgets('InputOtp syncs from value prop', (tester) async {
    await pumpTestApp(
      tester,
      const InputOtp(value: '456'),
    );

    for (int i = 0; i < 3; i++) {
      expect(
        (tester.widget<TextField>(find.byType(TextField).at(i)))
            .controller
            ?.text,
        equals('456'[i]),
      );
    }
  });

  testWidgets('InputOtp clears when value set to empty', (tester) async {
    await pumpTestApp(
      tester,
      const InputOtp(value: ''),
    );

    for (int i = 0; i < 6; i++) {
      expect(
        (tester.widget<TextField>(find.byType(TextField).at(i)))
            .controller
            ?.text,
        equals(''),
      );
    }
  });
}
