import 'package:flutter/material.dart';

import '../../../components/ui/input/input.dart';

class DynamicAsyncExample extends StatefulWidget {
  const DynamicAsyncExample({super.key});

  @override
  State<DynamicAsyncExample> createState() => _DynamicAsyncExampleState();
}

class _DynamicAsyncExampleState extends State<DynamicAsyncExample> {
  final _usernameCtrl = TextEditingController();
  String? _usernameError;
  bool _checking = false;

  Future<void> _checkUsername(String value) async {
    if (value.length < 3) {
      setState(() {
        _usernameError = null;
        _checking = false;
      });
      return;
    }
    setState(() => _checking = true);
    await Future<void>.delayed(const Duration(milliseconds: 800));
    if (!mounted) return;
    final taken = ['admin', 'user', 'test'].contains(value.toLowerCase());
    setState(() {
      _usernameError = taken ? 'Username is taken' : null;
      _checking = false;
    });
  }

  @override
  void dispose() {
    _usernameCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Input(
          label: 'Username',
          controller: _usernameCtrl,
          errorText: _usernameError,
          suffixIcon: _checking
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : null,
          onChanged: (v) {
            _usernameCtrl.text = v;
            _usernameCtrl.selection =
                TextSelection.fromPosition(TextPosition(offset: v.length));
            _checkUsername(v);
          },
        ),
        const SizedBox(height: 8),
        Text(
          _checking
              ? 'Checking availability...'
              : (_usernameError ?? 'Type a username (try admin)'),
          style: TextStyle(
            fontSize: 12,
            color: _usernameError != null ? Colors.red : Colors.grey,
          ),
        ),
      ],
    );
  }
}
