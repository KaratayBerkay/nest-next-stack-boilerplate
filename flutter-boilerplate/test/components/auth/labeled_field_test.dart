import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/auth/labeled_field.dart';
import 'package:flutter_boilerplate/components/ui/input/input.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Future<void> pumpField(WidgetTester tester, {bool showToggle = false}) {
    return tester.pumpWidget(
      MaterialApp(
        theme: buildThemeData(AppThemeMode.light),
        home: Scaffold(
          body: LabeledField(
            label: 'Password',
            obscureText: true,
            showVisibilityToggle: showToggle,
          ),
        ),
      ),
    );
  }

  group('LabeledField password visibility toggle', () {
    testWidgets('no eye icon and text stays obscured when disabled',
        (tester) async {
      await pumpField(tester);

      expect(find.byIcon(Icons.visibility_outlined), findsNothing);
      expect(find.byIcon(Icons.visibility_off_outlined), findsNothing);
      final input = tester.widget<Input>(find.byType(Input));
      expect(input.obscureText, isTrue);
    });

    // Regression: login and change-password previously passed only
    // `obscureText: true` with no toggle at all, unlike register and
    // reset-password — this is the capability that fix relies on.
    testWidgets('tapping the eye icon reveals and re-hides the password',
        (tester) async {
      await pumpField(tester, showToggle: true);

      expect(tester.widget<Input>(find.byType(Input)).obscureText, isTrue);
      expect(find.byIcon(Icons.visibility_outlined), findsOneWidget);

      await tester.tap(find.byIcon(Icons.visibility_outlined));
      await tester.pump();

      expect(tester.widget<Input>(find.byType(Input)).obscureText, isFalse);
      expect(find.byIcon(Icons.visibility_off_outlined), findsOneWidget);

      await tester.tap(find.byIcon(Icons.visibility_off_outlined));
      await tester.pump();

      expect(tester.widget<Input>(find.byType(Input)).obscureText, isTrue);
    });
  });
}
