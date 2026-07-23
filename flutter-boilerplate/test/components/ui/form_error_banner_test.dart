import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/form_error_banner/form_error_banner.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('FormErrorBanner renders error messages', (tester) async {
    await pumpTestApp(
      tester,
      const SizedBox(
        width: 300,
        child: FormErrorBanner(errors: ['Email is required', 'Password too short']),
      ),
    );

    expect(find.text('Email is required'), findsOneWidget);
    expect(find.text('Password too short'), findsOneWidget);
  });

  testWidgets('FormErrorBanner renders title', (tester) async {
    await pumpTestApp(
      tester,
      const SizedBox(
        width: 300,
        child: FormErrorBanner(
          errors: ['Invalid field'],
          title: 'Validation Error',
        ),
      ),
    );

    expect(find.text('Validation Error'), findsOneWidget);
  });

  testWidgets('FormErrorBanner returns empty when no errors', (tester) async {
    await pumpTestApp(
      tester,
      const SizedBox(
        width: 300,
        child: FormErrorBanner(errors: []),
      ),
    );

    expect(find.byType(SizedBox), findsWidgets);
  });
}
