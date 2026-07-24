import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/auth/actions.dart';
import '../../constants/theme.dart';
import '../../hooks/use_auth.dart';
import '../../types/auth/auth_request_types.dart';

class LoginForm extends ConsumerStatefulWidget {
  const LoginForm({super.key});

  @override
  ConsumerState<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends ConsumerState<LoginForm> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _mfaController = TextEditingController();
  Map<String, String> _fieldErrors = {};
  bool _submitting = false;
  String? _mfaToken;
  bool _mfaSubmitting = false;
  String? _mfaError;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _mfaController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    setState(() => _fieldErrors = {});
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty) {
      setState(() => _fieldErrors['email'] = 'Email is required');
      return;
    }
    if (password.isEmpty) {
      setState(() => _fieldErrors['password'] = 'Password is required');
      return;
    }

    setState(() => _submitting = true);
    try {
      final response = await ref.read(loginActionsProvider).login(
            LoginRequest(email: email, password: password),
          );
      await ref
          .read(authProvider.notifier)
          .setSession(response.accessToken, response.user);
      if (mounted) context.go('/v1/en/feed');
    } catch (err) {
      setState(() => _fieldErrors['form'] = err.toString());
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<void> _handleMfa() async {
    final code = _mfaController.text.trim();
    if (code.length < 6) {
      setState(() => _mfaError = 'Enter your 6-digit code');
      return;
    }
    setState(() => _mfaSubmitting = true);
    try {
      await ref.read(loginActionsProvider).login(
            LoginRequest(
              email: _emailController.text.trim(),
              password: _passwordController.text,
            ),
          );
      if (mounted) context.go('/v1/en/feed');
    } catch (err) {
      setState(() => _mfaError = err.toString());
    } finally {
      if (mounted) setState(() => _mfaSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    if (_mfaToken != null) {
      return _buildMfaForm(colors);
    }

    return Form(
      child: Column(
        children: [
          Text(
            'Sign In',
            style: TextStyle(color: colors.brand, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 16),
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
          const SizedBox(height: 4),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: () => context.go('/auth/forgot-password'),
              child: const Text(
                'Forgot password?',
                style: TextStyle(fontSize: 12),
              ),
            ),
          ),
          if (_fieldErrors.containsKey('form'))
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(
                _fieldErrors['form']!,
                style: TextStyle(color: colors.danger, fontSize: 13),
              ),
            ),
          FilledButton(
            onPressed: _submitting ? null : _handleLogin,
            child: Text(_submitting ? 'Signing in...' : 'Sign In'),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                "Don't have an account?",
                style: TextStyle(color: colors.fgMuted, fontSize: 12),
              ),
              TextButton(
                onPressed: () => context.go('/auth/register'),
                child: const Text('Register', style: TextStyle(fontSize: 12)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMfaForm(AppColors colors) {
    return Column(
      children: [
        Text(
          'Two-Factor Authentication',
          style: TextStyle(color: colors.brand, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        Text(
          'Enter the 6-digit code from your authenticator app.',
          style: TextStyle(color: colors.fgMuted, fontSize: 12),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _mfaController,
          decoration: InputDecoration(
            labelText: 'MFA Code',
            hintText: '000000',
            errorText: _mfaError,
          ),
          keyboardType: TextInputType.number,
          maxLength: 6,
        ),
        const SizedBox(height: 12),
        FilledButton(
          onPressed: _mfaSubmitting ? null : _handleMfa,
          child: Text(_mfaSubmitting ? 'Verifying...' : 'Verify'),
        ),
        TextButton(
          onPressed: () => setState(() => _mfaToken = null),
          child: const Text(
            'Use a different account',
            style: TextStyle(fontSize: 12),
          ),
        ),
      ],
    );
  }
}
