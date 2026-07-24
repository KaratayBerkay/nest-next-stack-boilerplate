import 'package:flutter/material.dart';
import '../../../components/ui/dropdown/dropdown.dart';
import '../../../l10n/app_localizations.dart';

class DropdownDemoPage extends StatelessWidget {
  final String lang;
  const DropdownDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiDropdownTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Text(
            'Basic Dropdown',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          DropdownWidget(
            items: [
              DropdownMenuItem(value: 'Option 1', child: Text('Option 1')),
              DropdownMenuItem(value: 'Option 2', child: Text('Option 2')),
              DropdownMenuItem(value: 'Option 3', child: Text('Option 3')),
            ],
            label: 'Select option',
          ),
        ],
      ),
    );
  }
}
