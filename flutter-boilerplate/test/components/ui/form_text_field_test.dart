import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/form_text_field.dart';
import 'package:flutter_boilerplate/validators/auth/schema.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('FormTextField renders label and hint', (tester) async {
    await pumpTestApp(
      tester,
      FormTextField(
        controller: TextEditingController(),
        label: 'Email',
        hint: 'Enter your email',
      ),
    );

    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Enter your email'), findsOneWidget);
  });

  testWidgets('FormTextField shows error on invalid input', (tester) async {
    final controller = TextEditingController();

    await pumpTestApp(
      tester,
      FormTextField(
        controller: controller,
        label: 'Email',
        validator: validateEmail,
      ),
    );

    controller.text = 'invalid';
    await tester.pump();
    await tester.pump();

    expect(find.text('Invalid email format'), findsOneWidget);
  });

  testWidgets('FormTextField shows no error for valid input', (tester) async {
    final controller = TextEditingController();

    await pumpTestApp(
      tester,
      FormTextField(
        controller: controller,
        label: 'Email',
        validator: validateEmail,
      ),
    );

    controller.text = 'user@example.com';
    await tester.pump();
    await tester.pump();

    expect(find.text('Invalid email format'), findsNothing);
  });

  testWidgets('FormTextField hides text when obscureText is true',
      (tester) async {
    await pumpTestApp(
      tester,
      FormTextField(
        controller: TextEditingController(text: 'secret'),
        label: 'Password',
        obscureText: true,
      ),
    );

    final textField = tester.widget<TextField>(find.byType(TextField));
    expect(textField.obscureText, isTrue);
  });

  testWidgets('FormTextField supports maxLines', (tester) async {
    await pumpTestApp(
      tester,
      FormTextField(
        controller: TextEditingController(),
        label: 'Bio',
        maxLines: 3,
      ),
    );

    final textField = tester.widget<TextField>(find.byType(TextField));
    expect(textField.maxLines, 3);
  });
}
