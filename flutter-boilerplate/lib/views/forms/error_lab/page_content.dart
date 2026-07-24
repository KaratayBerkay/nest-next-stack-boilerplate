import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../components/ui/button/button.dart';
import '../../../components/ui/form_text_field.dart';
import '../../../l10n/app_localizations.dart';
import '../../../validators/auth/schema.dart' as auth;

class FormsErrorLabPageContent extends ConsumerStatefulWidget {
  final String lang;

  const FormsErrorLabPageContent({super.key, required this.lang});

  @override
  ConsumerState<FormsErrorLabPageContent> createState() =>
      _FormsErrorLabPageContentState();
}

class _FormsErrorLabPageContentState
    extends ConsumerState<FormsErrorLabPageContent> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  String _scenario = 'server-error';

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.formsErrorLabPageTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Scenario',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: _scenario,
                      items: const [
                        DropdownMenuItem(
                          value: 'server-error',
                          child: Text('Server Error'),
                        ),
                        DropdownMenuItem(
                          value: 'validation',
                          child: Text('Validation Error'),
                        ),
                        DropdownMenuItem(
                          value: 'network',
                          child: Text('Network Timeout'),
                        ),
                        DropdownMenuItem(
                          value: 'rate-limit',
                          child: Text('Rate Limited'),
                        ),
                      ],
                      onChanged: (v) => setState(() => _scenario = v!),
                      decoration:
                          const InputDecoration(border: OutlineInputBorder()),
                    ),
                    const SizedBox(height: 16),
                    FormTextField(
                      controller: _emailCtrl,
                      label: 'Email',
                      validator: auth.validateEmail,
                    ),
                    const SizedBox(height: 8),
                    FormTextField(
                      controller: _passwordCtrl,
                      label: 'Password',
                      obscureText: true,
                      validator: auth.validatePassword,
                    ),
                    const SizedBox(height: 16),
                    Button(
                      child: const Text('Submit'),
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Simulated: $_scenario')),
                          );
                        }
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
