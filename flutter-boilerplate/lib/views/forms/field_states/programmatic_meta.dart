import 'package:flutter/material.dart';

import '../../../components/ui/input/input.dart';

class ProgrammaticMetaExample extends StatefulWidget {
  const ProgrammaticMetaExample({super.key});

  @override
  State<ProgrammaticMetaExample> createState() =>
      _ProgrammaticMetaExampleState();
}

class _ProgrammaticMetaExampleState extends State<ProgrammaticMetaExample> {
  final _fieldCtrl = TextEditingController();
  String? _errorText;
  String? _helperText;
  int _touched = 0;

  void _setError() {
    setState(() {
      _errorText = 'Simulated server error';
      _helperText = null;
    });
  }

  void _setHelper() {
    setState(() {
      _helperText = 'Field is valid';
      _errorText = null;
    });
  }

  void _clear() {
    setState(() {
      _errorText = null;
      _helperText = null;
    });
  }

  void _touch() {
    setState(() => _touched++);
  }

  @override
  void dispose() {
    _fieldCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Input(
          label: 'Programmatic Field',
          controller: _fieldCtrl,
          errorText: _errorText,
          helperText: _helperText,
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          children: [
            FilledButton(onPressed: _setError, child: const Text('Set Error')),
            OutlinedButton(
              onPressed: _setHelper,
              child: const Text('Set Helper'),
            ),
            TextButton(onPressed: _clear, child: const Text('Clear')),
            FilledButton.tonal(onPressed: _touch, child: const Text('Touch')),
          ],
        ),
        const SizedBox(height: 4),
        Text('Touched $_touched times', style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}
