import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/auth/actions.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';

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
    final t = AppLocalizations.of(context);
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      setState(() => _error = t.authErrorsEmailRequired);
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
    final t = AppLocalizations.of(context);

    if (_submitted) {
      return Column(
        children: [
          Text(
            t.authFormForgotPasswordTitle,
            style: TextStyle(color: colors.brand, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          Text(
            t.authFormForgotPasswordSuccess,
            style: TextStyle(color: colors.success, fontSize: 14),
          ),
          const SizedBox(height: 12),
          TextButton(
            onPressed: () => context.go('/auth/login'),
            child: Text(t.authFormForgotPasswordLoginLink),
          ),
        ],
      );
    }

    return Column(
      children: [
        Text(
          t.authFormForgotPasswordTitle,
          style: TextStyle(color: colors.brand, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        Text(
          t.authFormForgotPasswordDescription,
          style: TextStyle(color: colors.fgMuted, fontSize: 12),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _emailController,
          decoration: InputDecoration(
            labelText: t.authFormForgotPasswordEmailLabel,
            hintText: t.authFormForgotPasswordEmailPlaceholder,
            errorText: _error,
          ),
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 16),
        FilledButton(
          onPressed: _submitting ? null : _handleSubmit,
          child: Text(
            _submitting
                ? t.authFormForgotPasswordSubmitting
                : t.authFormForgotPasswordSubmit,
          ),
        ),
        const SizedBox(height: 8),
        TextButton(
          onPressed: () => context.go('/auth/login'),
          child: Text(
            t.authFormForgotPasswordLoginLink,
            style: const TextStyle(fontSize: 12),
          ),
        ),
      ],
    );
  }
}
