import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../api/client/auth/actions.dart';
import '../../../api/server/auth/login.dart';
import '../../../api/server/auth/register.dart';
import '../../../components/ui/form_text_field.dart';
import '../../../hooks/use_auth.dart';
import '../../../validators/auth/schema.dart';

class RegisterPageContent extends ConsumerStatefulWidget {
  const RegisterPageContent({super.key});

  @override
  ConsumerState<RegisterPageContent> createState() => _RegisterPageContentState();
}

class _RegisterPageContentState extends ConsumerState<RegisterPageContent> {
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {

    setState(() { _loading = true; _error = null; });

    try {
      final actions = ref.read(loginActionsProvider);
      final request = RegisterRequest(
        email: _emailCtrl.text,
        password: _passwordCtrl.text,
        name: _nameCtrl.text,
      );
      await actions.register(request);

      final loginReq = LoginRequest(email: _emailCtrl.text, password: _passwordCtrl.text);
      final loginRes = await actions.login(loginReq);
      await ref.read(authProvider.notifier).setSession(loginRes.accessToken, loginRes.user);

      if (mounted) context.go('/v1/en/feed');
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Register')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                FormTextField(
                  controller: _nameCtrl,
                  label: 'Name',
                  validator: validateName,
                ),
                const SizedBox(height: 12),
                FormTextField(
                  controller: _emailCtrl,
                  label: 'Email',
                  keyboardType: TextInputType.emailAddress,
                  validator: validateEmail,
                ),
                const SizedBox(height: 12),
                FormTextField(
                  controller: _passwordCtrl,
                  label: 'Password',
                  obscureText: true,
                  validator: validatePassword,
                ),
                if (_error != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error, fontSize: 13)),
                  ),
                const SizedBox(height: 20),
                FilledButton(
                  onPressed: _loading ? null : _handleRegister,
                  child: _loading
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Create Account'),
                ),
                TextButton(
                  onPressed: () => context.go('/auth/login'),
                  child: const Text('Already have an account?'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
