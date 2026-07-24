import 'package:flutter/material.dart';

import '../../../components/ui/input/input.dart';

class LinkedFieldsExample extends StatefulWidget {
  const LinkedFieldsExample({super.key});

  @override
  State<LinkedFieldsExample> createState() => _LinkedFieldsExampleState();
}

class _LinkedFieldsExampleState extends State<LinkedFieldsExample> {
  final _passCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  String? _passError;
  String? _confirmError;

  void _validate() {
    setState(() {
      _passError = _passCtrl.text.length < 6 ? 'At least 6 characters' : null;
      _confirmError =
          _confirmCtrl.text != _passCtrl.text ? 'Passwords do not match' : null;
    });
  }

  @override
  void dispose() {
    _passCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Input(
          label: 'Password',
          obscureText: true,
          controller: _passCtrl,
          errorText: _passError,
          onChanged: (_) => _validate(),
        ),
        const SizedBox(height: 8),
        Input(
          label: 'Confirm Password',
          obscureText: true,
          controller: _confirmCtrl,
          errorText: _confirmError,
          onChanged: (_) => _validate(),
        ),
        const SizedBox(height: 12),
        FilledButton(onPressed: _validate, child: const Text('Verify')),
      ],
    );
  }
}
