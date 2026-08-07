import 'package:flutter_boilerplate/views/ui/page_header/page_content.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../../test_helpers.dart';

void main() {
  testWidgets('renders all three examples without error', (tester) async {
    await pumpTestApp(tester, const PageHeaderDemoPage(lang: 'en'));

    expect(find.text('Dashboard'), findsOneWidget);
    expect(find.text('Projects'), findsOneWidget);
    expect(find.text('Section Title'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
