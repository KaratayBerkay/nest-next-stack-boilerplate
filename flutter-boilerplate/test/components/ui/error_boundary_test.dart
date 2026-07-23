import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/ui/error_boundary/error_boundary.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../test_helpers.dart';

void main() {
  testWidgets('renders child when no error', (tester) async {
    await pumpTestApp(
      tester,
      const ErrorBoundary(child: Text('Content')),
    );

    expect(find.text('Content'), findsOneWidget);
  });

  testWidgets('shows default fallback when error is set', (tester) async {
    await pumpTestApp(
      tester,
      const ErrorBoundary(
        error: 'Test error',
        child: Text('Content'),
      ),
    );

    expect(find.text('Something went wrong'), findsOneWidget);
    expect(find.text('Test error'), findsOneWidget);
    expect(find.text('Try again'), findsOneWidget);
    expect(find.text('Content'), findsNothing);
  });

  testWidgets('renders custom fallback', (tester) async {
    await pumpTestApp(
      tester,
      const ErrorBoundary(
        fallbackBuilder: _customFallback,
        child: Text('Normal'),
      ),
    );

    expect(find.text('Normal'), findsOneWidget);
  });
}

Widget _customFallback(Object error, VoidCallback onRetry) {
  return const Text('Custom error');
}
