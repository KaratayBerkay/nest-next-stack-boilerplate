import 'package:flutter/material.dart';

class FormFieldInfoDemoPage extends StatelessWidget {
  final String lang;
  const FormFieldInfoDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Form Field Info')),
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
                      helperStyle: TextStyle(color: colors.onSurfaceVariant, fontSize: 12),
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
