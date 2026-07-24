import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/auth/actions.dart';
import '../../constants/theme.dart';
import '../../types/auth/auth_request_types.dart';

class RegisterForm extends ConsumerStatefulWidget {
  const RegisterForm({super.key});

  @override
  ConsumerState<RegisterForm> createState() => _RegisterFormState();
}

class _RegisterFormState extends ConsumerState<RegisterForm> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  Map<String, String> _fieldErrors = {};
  bool _submitting = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    setState(() => _fieldErrors = {});
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty) {
      setState(() => _fieldErrors['email'] = 'Email is required');
      return;
    }
    if (password.length < 8) {
      setState(
        () =>
            _fieldErrors['password'] = 'Password must be at least 8 characters',
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      await ref.read(loginActionsProvider).register(
            RegisterRequest(email: email, password: password, name: name),
          );
      if (mounted) context.go('/v1/en/feed');
    } catch (err) {
      setState(() => _fieldErrors['form'] = err.toString());
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      children: [
        Text(
          'Create Account',
          style: TextStyle(color: colors.brand, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _nameController,
          decoration:
              const InputDecoration(labelText: 'Name', hintText: 'Your name'),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _emailController,
          decoration: InputDecoration(
            labelText: 'Email',
            hintText: 'you@example.com',
            errorText: _fieldErrors['email'],
          ),
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _passwordController,
          decoration: InputDecoration(
            labelText: 'Password',
            errorText: _fieldErrors['password'],
          ),
          obscureText: true,
        ),
        if (_fieldErrors.containsKey('form'))
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(
              _fieldErrors['form']!,
              style: TextStyle(color: colors.danger, fontSize: 13),
            ),
          ),
        const SizedBox(height: 12),
        FilledButton(
          onPressed: _submitting ? null : _handleRegister,
          child: Text(_submitting ? 'Creating account...' : 'Create Account'),
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Already have an account?',
              style: TextStyle(color: colors.fgMuted, fontSize: 12),
            ),
            TextButton(
              onPressed: () => context.go('/auth/login'),
              child: const Text('Sign In', style: TextStyle(fontSize: 12)),
            ),
          ],
        ),
      ],
    );
  }
}
