import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/confirm_dialog/confirm_dialog.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('renders ConfirmDialogWidget', (tester) async {
    await pumpTestApp(
      tester,
      const ConfirmDialogWidget(
        title: 'Are you sure?',
        message: 'This action cannot be undone.',
      ),
    );
    expect(find.byType(ConfirmDialogWidget), findsOneWidget);
  });

  testWidgets('show displays dialog with title and message', (tester) async {
    await pumpTestApp(tester, const SizedBox());
    ConfirmDialogWidget.show(
      tester.element(find.byType(SizedBox)),
      title: 'Delete?',
      message: 'Permanently delete this item?',
    );
    await tester.pump();
    expect(find.text('Delete?'), findsOneWidget);
    expect(find.text('Permanently delete this item?'), findsOneWidget);
  });

  testWidgets('show displays confirm and cancel buttons', (tester) async {
    await pumpTestApp(tester, const SizedBox());
    ConfirmDialogWidget.show(
      tester.element(find.byType(SizedBox)),
      title: 'Confirm?',
      message: 'Proceed?',
    );
    await tester.pump();
    expect(find.text('Confirm?'), findsOneWidget);
    expect(find.text('Proceed?'), findsOneWidget);
    expect(find.text('Cancel'), findsOneWidget);
  });

  testWidgets('show uses custom button labels', (tester) async {
    await pumpTestApp(tester, const SizedBox());
    ConfirmDialogWidget.show(
      tester.element(find.byType(SizedBox)),
      title: 'Save',
      message: 'Save changes?',
      confirmText: 'Yes',
      cancelText: 'No',
    );
    await tester.pump();
    expect(find.text('Yes'), findsOneWidget);
    expect(find.text('No'), findsOneWidget);
  });

  testWidgets('cancel button dismisses dialog', (tester) async {
    await pumpTestApp(tester, const SizedBox());
    ConfirmDialogWidget.show(
      tester.element(find.byType(SizedBox)),
      title: 'Title',
      message: 'Message',
    );
    await tester.pump();
    await tester.tap(find.text('Cancel'));
    await tester.pump();
    expect(find.text('Title'), findsNothing);
  });

  testWidgets('confirm button dismisses dialog', (tester) async {
    await pumpTestApp(tester, const SizedBox());
    ConfirmDialogWidget.show(
      tester.element(find.byType(SizedBox)),
      title: 'Title',
      message: 'Message',
    );
    await tester.pump();
    await tester.tap(find.text('Confirm'));
    await tester.pump();
    expect(find.text('Title'), findsNothing);
  });
}
