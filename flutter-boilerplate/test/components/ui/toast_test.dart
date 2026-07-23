import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/toast/toast.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('shows toast message', (tester) async {
    await pumpTestApp(tester, const SizedBox());
    showToast(tester.element(find.byType(SizedBox)), 'Hello');
    await tester.pump();
    expect(find.text('Hello'), findsOneWidget);
  });

  testWidgets('shows success toast', (tester) async {
    await pumpTestApp(tester, const SizedBox());
    showToast(tester.element(find.byType(SizedBox)), 'Success', type: ToastType.success);
    await tester.pump();
    expect(find.text('Success'), findsOneWidget);
  });

  testWidgets('shows error toast', (tester) async {
    await pumpTestApp(tester, const SizedBox());
    showToast(tester.element(find.byType(SizedBox)), 'Error', type: ToastType.error);
    await tester.pump();
    expect(find.text('Error'), findsOneWidget);
  });

  testWidgets('shows warning toast', (tester) async {
    await pumpTestApp(tester, const SizedBox());
    showToast(tester.element(find.byType(SizedBox)), 'Warning', type: ToastType.warning);
    await tester.pump();
    expect(find.text('Warning'), findsOneWidget);
  });

  testWidgets('shows info toast', (tester) async {
    await pumpTestApp(tester, const SizedBox());
    showToast(tester.element(find.byType(SizedBox)), 'Info');
    await tester.pump();
    expect(find.text('Info'), findsOneWidget);
  });


}
