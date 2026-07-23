import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/spinner/spinner.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('Spinner shows circular progress', (tester) async {
    await pumpTestApp(tester, const Spinner());

    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });

  testWidgets('Spinner accepts size override', (tester) async {
    await pumpTestApp(tester, const Spinner(size: 48));

    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}
