import 'package:flutter_boilerplate/views/ui/table/page_content.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../../test_helpers.dart';

void main() {
  testWidgets('renders both demo tables without error', (tester) async {
    await pumpTestApp(tester, const TablePageContent(lang: 'en'));

    expect(find.text('Alice Johnson'), findsOneWidget);
    expect(find.text('PRD-1000'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
