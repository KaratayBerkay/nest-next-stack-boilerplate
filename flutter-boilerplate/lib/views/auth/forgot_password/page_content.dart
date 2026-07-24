import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../api/client/auth/actions.dart';
import '../../../components/auth/auth_layout.dart';
import '../../../components/auth/labeled_field.dart';
import '../../../components/auth/link_text.dart';
import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

class ForgotPasswordPageContent extends ConsumerStatefulWidget {
  const ForgotPasswordPageContent({super.key});

  @override
  ConsumerState<ForgotPasswordPageContent> createState() =>
      _ForgotPasswordPageContentState();
}

class _ForgotPasswordPageContentState
    extends ConsumerState<ForgotPasswordPageContent> {
  final _emailCtrl = TextEditingController();
  bool _submitting = false;
  bool _sent = false;
  String? _error;

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _emailCtrl.text.trim();
    final t = AppLocalizations.of(context);

    if (email.isEmpty) {
      setState(() => _error = t.authErrorsEmailRequired);
      return;
    }

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      final actions = ref.read(loginActionsProvider);
      await actions.requestPasswordReset(email);
      if (mounted) setState(() => _sent = true);
    } on DioException catch (e) {
      final data = e.response?.data;
      final msg =
          (data is Map && data['msg'] is String) ? data['msg'] as String : null;
      setState(() => _error = msg ?? 'Failed to send reset email');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);

    return AuthLayout(
      child: _sent ? _buildSent(t) : _buildForm(t),
    );
  }

  Widget _buildSent(AppLocalizations t) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Icon(
          Icons.check_circle,
          color: AppColors.of(context).success,
          size: 48,
        ),
        const SizedBox(height: 16),
        Text(
          t.authFormForgotPasswordSuccess,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 14),
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 36,
          child: Button(
            onPressed: () => context.go('/auth/login'),
            child: Text(t.authFormForgotPasswordLoginLink),
          ),
        ),
      ],
    );
  }

  Widget _buildForm(AppLocalizations t) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          t.authFormForgotPasswordTitle,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: colors.brand,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          t.authFormForgotPasswordDescription,
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 12, color: colors.fgMuted),
        ),
        const SizedBox(height: 16),
        LabeledField(
          label: t.authFormForgotPasswordEmailLabel,
          required: true,
          hint: t.authFormLoginEmailPlaceholder,
          controller: _emailCtrl,
          keyboardType: TextInputType.emailAddress,
          errorText: _error,
          textInputAction: TextInputAction.done,
          onSubmitted: _submit,
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 36,
          child: Button(
            fullWidth: true,
            loading: _submitting,
            onPressed: _submitting ? null : _submit,
            child: Text(
              _submitting ? t.authLoading : t.authFormForgotPasswordSubmit,
            ),
          ),
        ),
        const SizedBox(height: 16),
        Center(
          child: LinkText(
            t.authFormForgotPasswordLoginLink,
            onTap: () => context.go('/auth/login'),
          ),
        ),
      ],
    );
  }
}
