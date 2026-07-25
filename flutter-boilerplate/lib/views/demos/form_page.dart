import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class FormDemoPage extends StatefulWidget {
  final String lang;
  const FormDemoPage({super.key, required this.lang});

  @override
  State<FormDemoPage> createState() => _FormDemoPageState();
}

class _FormDemoPageState extends State<FormDemoPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  String _result = '';

  void _submit() {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _result = AppLocalizations.of(context)
            .demoFormSignedUp(_nameCtrl.text, _emailCtrl.text);
      });
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          t.demoFormSignupDemo,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        const Text(
          'Client-side validation fires on change; server-side runs on submit.',
          style: TextStyle(fontSize: 13, color: Colors.grey),
        ),
        const SizedBox(height: 16),
        Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _nameCtrl,
                decoration: InputDecoration(
                  labelText: t.demoFormName,
                  border: const OutlineInputBorder(),
                ),
                validator: (v) =>
                    (v == null || v.isEmpty) ? t.demoFormNameRequired : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _emailCtrl,
                decoration: InputDecoration(
                  labelText: t.demoFormEmail,
                  border: const OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
                validator: (v) {
                  if (v == null || v.isEmpty) return t.demoFormEmailRequired;
                  if (!v.contains('@')) return t.demoFormEmailInvalid;
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _passwordCtrl,
                decoration: InputDecoration(
                  labelText: t.demoFormPassword,
                  border: const OutlineInputBorder(),
                ),
                obscureText: true,
                validator: (v) {
                  if (v == null || v.isEmpty) {
                    return t.demoFormPasswordRequired;
                  }
                  if (v.length < 6) return t.demoFormMinChars;
                  return null;
                },
              ),
              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: _submit,
                icon: const Icon(Icons.send),
                label: Text(t.demoFormPageSignUp),
              ),
            ],
          ),
        ),
        if (_result.isNotEmpty) ...[
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Text(_result),
            ),
          ),
        ],
      ],
    );
  }
}
