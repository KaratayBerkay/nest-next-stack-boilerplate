import 'package:flutter/material.dart';
import '../../../l10n/app_localizations.dart';

class FormFieldInfoDemoPage extends StatelessWidget {
  final String lang;
  const FormFieldInfoDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiFormFieldInfoTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Password', style: TextStyle(color: colors.onSurface)),
                  const SizedBox(height: 4),
                  TextField(
                    decoration: InputDecoration(
                      border: const OutlineInputBorder(),
                      hintText: 'Enter password',
                      helperText: 'Must be at least 8 characters with a number',
                      helperStyle: TextStyle(
                        color: colors.onSurfaceVariant,
                        fontSize: 12,
                      ),
                    ),
                    obscureText: true,
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
