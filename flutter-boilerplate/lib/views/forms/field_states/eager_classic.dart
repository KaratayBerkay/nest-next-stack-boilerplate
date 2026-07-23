import 'package:flutter/material.dart';

import '../../../components/ui/input/input.dart';

class EagerClassicExample extends StatefulWidget {
  const EagerClassicExample({super.key});

  @override
  State<EagerClassicExample> createState() => _EagerClassicExampleState();
}

class _EagerClassicExampleState extends State<EagerClassicExample> {
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  String? _nameError;
  String? _emailError;

  void _validate() {
    setState(() {
      _nameError = _nameCtrl.text.isEmpty ? 'Name is required' : null;
      _emailError = _emailCtrl.text.isEmpty ? 'Email is required' : null;
    });
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Input(label: 'Name', controller: _nameCtrl, errorText: _nameError, onChanged: (_) => _validate()),
        const SizedBox(height: 8),
        Input(label: 'Email', controller: _emailCtrl, errorText: _emailError, onChanged: (_) => _validate()),
        const SizedBox(height: 12),
        FilledButton(onPressed: _validate, child: const Text('Validate')),
      ],
    );
  }
}
