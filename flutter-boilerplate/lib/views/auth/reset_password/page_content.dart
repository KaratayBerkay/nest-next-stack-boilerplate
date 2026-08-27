import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../api/client/auth/actions.dart';
import '../../../components/auth/auth_layout.dart';
import '../../../components/auth/labeled_field.dart';
import '../../../components/auth/password_requirements.dart';
import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

class ResetPasswordPageContent extends ConsumerStatefulWidget {
  final String token;

  const ResetPasswordPageContent({super.key, this.token = ''});

  @override
  ConsumerState<ResetPasswordPageContent> createState() =>
      _ResetPasswordPageContentState();
}

class _ResetPasswordPageContentState
    extends ConsumerState<ResetPasswordPageContent> {
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _submitting = false;
  bool _done = false;
  String? _error;

  @override
  void dispose() {
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  bool _validate() {
    final t = AppLocalizations.of(context);
    final password = _passwordCtrl.text;

    if (password.isEmpty) {
      setState(() => _error = t.authErrorsPasswordRequired);
      return false;
    }
    if (password.length < 8) {
      setState(() => _error = t.authErrorsPasswordMin);
      return false;
    }
    if (_confirmCtrl.text != password) {
      setState(() => _error = t.authErrorsPasswordsMustMatch);
      return false;
    }

    return true;
  }

  Future<void> _submit() async {
    if (!_validate()) return;

    setState(() {
      _submitting = true;
      _error = null;
    });

    final t = AppLocalizations.of(context);
    try {
      final actions = ref.read(loginActionsProvider);
      await actions.resetPassword(widget.token, _passwordCtrl.text);
      if (mounted) {
        setState(() => _done = true);
        Timer(const Duration(seconds: 2), () {
          if (mounted) context.go('/auth/login');
        });
      }
    } on DioException catch (e) {
      final data = e.response?.data;
      final msg =
          (data is Map && data['msg'] is String) ? data['msg'] as String : null;
      setState(() => _error = msg ?? t.authErrorsResetPasswordFailed);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);

    if (widget.token.isEmpty) {
      return AuthLayout(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 32),
          child: Text(
            t.authErrorsResetPasswordTokenMissing,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 14),
          ),
        ),
      );
    }

    return AuthLayout(
      child: _done ? _buildDone(t) : _buildForm(t),
    );
  }

  Widget _buildDone(AppLocalizations t) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Icon(Icons.check_circle, color: colors.success, size: 48),
        const SizedBox(height: 16),
        Text(
          t.authFormResetPasswordSuccess,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 14),
        ),
        const SizedBox(height: 16),
        Text(
          t.authFormResetPasswordLoginLink,
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 12, color: colors.fgMuted),
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
          t.authFormResetPasswordTitle,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: colors.brand,
          ),
        ),
        const SizedBox(height: 16),
        LabeledField(
          label: t.authFormResetPasswordPasswordLabel,
          required: true,
          controller: _passwordCtrl,
          obscureText: true,
          showVisibilityToggle: true,
          errorText: _error,
          textInputAction: TextInputAction.next,
          onChanged: (_) => setState(() {}),
        ),
        const SizedBox(height: 6),
        PasswordRequirements(password: _passwordCtrl.text),
        const SizedBox(height: 12),
        LabeledField(
          label: t.authFormResetPasswordConfirmPasswordLabel,
          required: true,
          controller: _confirmCtrl,
          obscureText: true,
          showVisibilityToggle: true,
          textInputAction: TextInputAction.done,
          onSubmitted: _submit,
        ),
        if (_error != null) ...[
          const SizedBox(height: 12),
          Text(
            _error!,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 14, color: colors.danger),
          ),
        ],
        const SizedBox(height: 12),
        SizedBox(
          height: 36,
          child: Button(
            fullWidth: true,
            loading: _submitting,
            onPressed: _submitting ? null : _submit,
            child: Text(
              _submitting ? t.authLoading : t.authFormResetPasswordSubmit,
            ),
          ),
        ),
      ],
    );
  }
}
