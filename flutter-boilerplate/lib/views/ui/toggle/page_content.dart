import 'package:flutter/material.dart';
import '../../../l10n/app_localizations.dart';

class ToggleDemoPage extends StatefulWidget {
  final String lang;
  const ToggleDemoPage({super.key, required this.lang});

  @override
  State<ToggleDemoPage> createState() => _ToggleDemoPageState();
}

class _ToggleDemoPageState extends State<ToggleDemoPage> {
  bool _bold = false;
  bool _italic = false;
  bool _underline = false;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiToggleTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Text Formatting',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          ToggleButtons(
            isSelected: [_bold, _italic, _underline],
            onPressed: (i) {
              setState(() {
                if (i == 0) _bold = !_bold;
                if (i == 1) _italic = !_italic;
                if (i == 2) _underline = !_underline;
              });
            },
            children: const [
              Icon(Icons.format_bold),
              Icon(Icons.format_italic),
              Icon(Icons.format_underline),
            ],
          ),
        ],
      ),
    );
  }
}
