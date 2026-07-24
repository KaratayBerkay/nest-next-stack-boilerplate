import 'package:flutter/material.dart';
import '../../../l10n/app_localizations.dart';

class NativeSelectDemoPage extends StatefulWidget {
  final String lang;
  const NativeSelectDemoPage({super.key, required this.lang});

  @override
  State<NativeSelectDemoPage> createState() => _NativeSelectDemoPageState();
}

class _NativeSelectDemoPageState extends State<NativeSelectDemoPage> {
  String _selected = 'option1';

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiNativeSelectTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: DropdownButtonFormField<String>(
                initialValue: _selected,
                items: const [
                  DropdownMenuItem(value: 'option1', child: Text('Option 1')),
                  DropdownMenuItem(value: 'option2', child: Text('Option 2')),
                  DropdownMenuItem(value: 'option3', child: Text('Option 3')),
                ],
                onChanged: (v) => setState(() => _selected = v!),
                decoration: const InputDecoration(
                  labelText: 'Native Select',
                  border: OutlineInputBorder(),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
