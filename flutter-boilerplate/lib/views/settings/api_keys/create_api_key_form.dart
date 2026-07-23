import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';

class CreateApiKeyForm extends StatefulWidget {
  final Future<void> Function(String name) onCreate;

  const CreateApiKeyForm({
    super.key,
    required this.onCreate,
  });

  @override
  State<CreateApiKeyForm> createState() => _CreateApiKeyFormState();
}

class _CreateApiKeyFormState extends State<CreateApiKeyForm> {
  final _nameCtrl = TextEditingController();
  bool _creating = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final name = _nameCtrl.text.trim();
    if (name.isEmpty) return;

    setState(() => _creating = true);
    try {
      await widget.onCreate(name);
    } finally {
      if (mounted) setState(() => _creating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          controller: _nameCtrl,
          decoration: const InputDecoration(labelText: 'Key Name'),
          autofocus: true,
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            const SizedBox(width: 8),
            Button(
              onPressed: _creating ? null : _submit,
              child: Text(_creating ? 'Creating...' : 'Create'),
            ),
          ],
        ),
      ],
    );
  }
}
