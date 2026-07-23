import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/spinner/spinner.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('renders CircularProgressIndicator', (tester) async {
    await pumpTestApp(tester, const LogoSpinner());

    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}
