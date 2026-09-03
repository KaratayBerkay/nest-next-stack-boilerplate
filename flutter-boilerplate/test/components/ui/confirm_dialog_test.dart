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

  // Regression (MOB-030): the app's real authenticated routes sit inside a
  // GoRouter ShellRoute, which nests its own Navigator below MaterialApp's.
  // showDialog() pushes onto the *root* navigator by default, so popping via
  // `Navigator.of(<the caller's own context>)` — which resolves to the
  // nearest, nested navigator, not the root one actually holding the dialog
  // route — never actually closed it: the dialog hung forever with no error,
  // just a stuck barrier. pumpTestApp's single-Navigator harness above can't
  // reproduce this (there's nothing for a nested lookup to resolve to
  // *incorrectly*), so this test builds the nested-Navigator shape by hand.
  testWidgets('confirm dismisses correctly when shown from a nested Navigator',
      (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Navigator(
          onGenerateRoute: (settings) => MaterialPageRoute(
            builder: (context) => Scaffold(
              body: Builder(
                builder: (innerContext) => TextButton(
                  onPressed: () => ConfirmDialogWidget.show(
                    innerContext,
                    title: 'Nested Title',
                    message: 'Nested Message',
                  ),
                  child: const Text('Open'),
                ),
              ),
            ),
          ),
        ),
      ),
    );

    await tester.tap(find.text('Open'));
    await tester.pump();
    expect(find.text('Nested Title'), findsOneWidget);

    await tester.tap(find.text('Confirm'));
    await tester.pump();
    expect(find.text('Nested Title'), findsNothing);
  });
}
