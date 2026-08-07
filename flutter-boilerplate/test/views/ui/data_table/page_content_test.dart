import 'package:flutter_boilerplate/views/ui/data_table/page_content.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../../test_helpers.dart';

void main() {
  testWidgets('renders both the basic and searchable demo tables',
      (tester) async {
    await pumpTestApp(tester, const DataTableDemoPage(lang: 'en'));

    expect(find.text('Alice Johnson'), findsNWidgets(2));
    expect(find.text('paid'), findsNWidgets(2 * 4));
    expect(tester.takeException(), isNull);
  });
}
