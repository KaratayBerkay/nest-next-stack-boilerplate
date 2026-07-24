import 'package:flutter/material.dart';

import '../../../components/ui/input/input.dart';
import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

class InputPageContent extends StatefulWidget {
  final String lang;

  const InputPageContent({super.key, required this.lang});

  @override
  State<InputPageContent> createState() => _InputPageContentState();
}

class _InputPageContentState extends State<InputPageContent> {
  final _basicCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _numberCtrl = TextEditingController();
  final _searchCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _basicCtrl.dispose();
    _passwordCtrl.dispose();
    _numberCtrl.dispose();
    _searchCtrl.dispose();
    _emailCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(t.uiInputTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Basic Input',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Input(label: 'Label', hintText: 'Placeholder text'),
          const SizedBox(height: 16),
          const Text(
            'With Helper',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Input(
            label: 'Email',
            hintText: 'you@example.com',
            helperText: 'We won\'t share your email',
          ),
          const SizedBox(height: 16),
          const Text(
            'With Error',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Input(label: 'Username', errorText: 'Required field'),
          const SizedBox(height: 16),
          const Text(
            'Prefix & Suffix Icons',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Input(
            hintText: 'Search...',
            prefixIcon: Icon(Icons.search, size: 18, color: colors.fgMuted),
            suffixIcon: Icon(Icons.clear, size: 18, color: colors.fgMuted),
          ),
          const SizedBox(height: 16),
          const Text(
            'Password',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Input(
            label: 'Password',
            obscureText: _obscurePassword,
            suffixIcon: IconButton(
              icon: Icon(
                _obscurePassword ? Icons.visibility_off : Icons.visibility,
                size: 18,
              ),
              onPressed: () =>
                  setState(() => _obscurePassword = !_obscurePassword),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Number Input',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Input(
            label: 'Quantity',
            hintText: '0',
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 16),
          const Text(
            'Disabled State',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Input(
            controller: TextEditingController(text: 'Pre-filled value'),
          ),
        ],
      ),
    );
  }
}
