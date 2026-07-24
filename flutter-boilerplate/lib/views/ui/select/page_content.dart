import 'package:flutter/material.dart';
import '../../../components/ui/select/select.dart';
import '../../../l10n/app_localizations.dart';

class SelectDemoPage extends StatelessWidget {
  final String lang;
  const SelectDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiSelectTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Text(
            'Basic Select',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          SelectWidget(items: ['Item 1', 'Item 2', 'Item 3']),
          SizedBox(height: 24),
          Text(
            'With Label',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          SelectWidget(
            items: ['Option A', 'Option B', 'Option C'],
            label: 'Choose option',
          ),
        ],
      ),
    );
  }
}
