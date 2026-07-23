import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/breadcrumb/breadcrumb.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('BreadcrumbWidget renders items', (tester) async {
    await pumpTestApp(
      tester,
      BreadcrumbWidget(items: const [
        BreadcrumbItem(label: 'Home'),
        BreadcrumbItem(label: 'Settings'),
      ]),
    );

    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Settings'), findsOneWidget);
  });
}
