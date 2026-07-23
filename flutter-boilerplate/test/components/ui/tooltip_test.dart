import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/tooltip/tooltip.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('TooltipWidget renders child', (tester) async {
    await pumpTestApp(tester, const TooltipWidget(message: 'Info', child: Text('Hover')));

    expect(find.text('Hover'), findsOneWidget);
  });
}
