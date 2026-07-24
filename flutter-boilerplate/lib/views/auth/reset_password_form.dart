import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/auth/actions.dart';
import '../../constants/theme.dart';

class ResetPasswordForm extends ConsumerStatefulWidget {
  final String? token;

  const ResetPasswordForm({super.key, this.token});

  @override
  ConsumerState<ResetPasswordForm> createState() => _ResetPasswordFormState();
}

class _ResetPasswordFormState extends ConsumerState<ResetPasswordForm> {
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  Map<String, String> _fieldErrors = {};
  bool _submitting = false;
  bool _success = false;

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    setState(() => _fieldErrors = {});
    final password = _passwordController.text;
    final confirm = _confirmController.text;

    if (password.length < 8) {
      setState(
        () =>
            _fieldErrors['password'] = 'Password must be at least 8 characters',
      );
      return;
    }
    if (password != confirm) {
      setState(() => _fieldErrors['confirm'] = 'Passwords do not match');
      return;
    }

    setState(() => _submitting = true);
    try {
      await ref
          .read(loginActionsProvider)
          .resetPassword(widget.token!, password);
      setState(() => _success = true);
    } catch (err) {
      setState(() => _fieldErrors['form'] = err.toString());
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    if (widget.token == null) {
      return Column(
        children: [
          Text(
            'Reset Password',
            style: TextStyle(color: colors.brand, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          Text(
            'Invalid or missing reset token.',
            style: TextStyle(color: colors.danger, fontSize: 14),
          ),
        ],
      );
    }

    if (_success) {
      return Column(
        children: [
          Text(
            'Reset Password',
            style: TextStyle(color: colors.brand, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          Text(
            'Password reset successfully!',
            style: TextStyle(color: colors.success, fontSize: 14),
          ),
          const SizedBox(height: 12),
          TextButton(
            onPressed: () => context.go('/auth/login'),
            child: const Text('Sign In'),
          ),
        ],
      );
    }

    return Column(
      children: [
        Text(
          'Reset Password',
          style: TextStyle(color: colors.brand, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _passwordController,
          decoration: InputDecoration(
            labelText: 'New Password',
            errorText: _fieldErrors['password'],
          ),
          obscureText: true,
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _confirmController,
          decoration: InputDecoration(
            labelText: 'Confirm Password',
            errorText: _fieldErrors['confirm'],
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
        const SizedBox(height: 16),
        FilledButton(
          onPressed: _submitting ? null : _handleSubmit,
          child: Text(_submitting ? 'Resetting...' : 'Reset Password'),
        ),
      ],
    );
  }
}
