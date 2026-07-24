import 'package:flutter/material.dart';
import '../../../l10n/app_localizations.dart';

class RadioGroupDemoPage extends StatefulWidget {
  final String lang;
  const RadioGroupDemoPage({super.key, required this.lang});

  @override
  State<RadioGroupDemoPage> createState() => _RadioGroupDemoPageState();
}

class _RadioGroupDemoPageState extends State<RadioGroupDemoPage> {
  String _selected = 'option1';

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiRadioGroupTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Select an option',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  RadioGroup<String>(
                    groupValue: _selected,
                    onChanged: (v) => setState(() => _selected = v!),
                    child: const Column(
                      children: [
                        RadioListTile(
                          value: 'option1',
                          title: Text('Option 1'),
                        ),
                        RadioListTile(
                          value: 'option2',
                          title: Text('Option 2'),
                        ),
                        RadioListTile(
                          value: 'option3',
                          title: Text('Option 3'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
