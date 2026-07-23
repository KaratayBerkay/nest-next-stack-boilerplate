import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../api/client/auth/actions.dart';
import '../../../api/server/auth/login.dart';
import '../../../hooks/use_auth.dart';
import '../../../components/ui/form_text_field.dart';
import '../../../validators/auth/schema.dart';

class LoginPageContent extends ConsumerStatefulWidget {
  const LoginPageContent({super.key});

  @override
  ConsumerState<LoginPageContent> createState() => _LoginPageContentState();
}

class _LoginPageContentState extends ConsumerState<LoginPageContent> {
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {

    setState(() { _loading = true; _error = null; });

    try {
      final actions = ref.read(loginActionsProvider);
      final request = LoginRequest(email: _emailCtrl.text, password: _passwordCtrl.text);
      final response = await actions.login(request);

      await ref.read(authProvider.notifier).setSession(response.accessToken, response.user);

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
      appBar: AppBar(title: const Text('Login')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
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
                  onPressed: _loading ? null : _handleLogin,
                  child: _loading
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Sign In'),
                ),
                TextButton(
                  onPressed: () => context.go('/auth/register'),
                  child: const Text('Create account'),
                ),
                TextButton(
                  onPressed: () => context.go('/auth/forgot-password'),
                  child: const Text('Forgot password?'),
                ),
              ],
            ),
          ),
        ),
    );
  }
}
