import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/auth/actions.dart';
import '../../constants/theme.dart';

class ForgotPasswordForm extends ConsumerStatefulWidget {
  const ForgotPasswordForm({super.key});

  @override
  ConsumerState<ForgotPasswordForm> createState() => _ForgotPasswordFormState();
}

class _ForgotPasswordFormState extends ConsumerState<ForgotPasswordForm> {
  final _emailController = TextEditingController();
  String? _error;
  bool _submitting = false;
  bool _submitted = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      setState(() => _error = 'Email is required');
      return;
    }

    setState(() {
      _error = null;
      _submitting = true;
    });

    try {
      await ref.read(loginActionsProvider).requestPasswordReset(email);
      setState(() => _submitted = true);
    } catch (err) {
      setState(() => _error = err.toString());
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    if (_submitted) {
      return Column(
        children: [
          Text(
            'Reset Password',
            style: TextStyle(color: colors.brand, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          Text(
            'Check your email for reset instructions.',
            style: TextStyle(color: colors.success, fontSize: 14),
          ),
          const SizedBox(height: 12),
          TextButton(
            onPressed: () => context.go('/auth/login'),
            child: const Text('Back to Sign In'),
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
        const SizedBox(height: 8),
        Text(
          'Enter your email to receive reset instructions.',
          style: TextStyle(color: colors.fgMuted, fontSize: 12),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _emailController,
          decoration: InputDecoration(
            labelText: 'Email',
            hintText: 'you@example.com',
            errorText: _error,
          ),
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 16),
        FilledButton(
          onPressed: _submitting ? null : _handleSubmit,
          child: Text(_submitting ? 'Sending...' : 'Send Reset Link'),
        ),
        const SizedBox(height: 8),
        TextButton(
          onPressed: () => context.go('/auth/login'),
          child: const Text('Back to Sign In', style: TextStyle(fontSize: 12)),
        ),
      ],
    );
  }
}
