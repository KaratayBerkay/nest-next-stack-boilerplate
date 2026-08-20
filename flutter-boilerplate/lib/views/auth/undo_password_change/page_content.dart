import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../api/client/auth/actions.dart';
import '../../../components/auth/auth_layout.dart';
import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

class UndoPasswordChangePageContent extends ConsumerStatefulWidget {
  final String token;

  const UndoPasswordChangePageContent({super.key, this.token = ''});

  @override
  ConsumerState<UndoPasswordChangePageContent> createState() =>
      _UndoPasswordChangePageContentState();
}

class _UndoPasswordChangePageContentState
    extends ConsumerState<UndoPasswordChangePageContent> {
  bool _submitting = false;
  bool _done = false;
  String? _error;

  Future<void> _submit() async {
    setState(() {
      _submitting = true;
      _error = null;
    });

    final t = AppLocalizations.of(context);
    try {
      final actions = ref.read(loginActionsProvider);
      await actions.undoPasswordChange(widget.token);
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
      setState(() => _error = msg ?? t.authErrorsUndoPasswordChangeFailed);
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
            t.authErrorsUndoPasswordChangeTokenMissing,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 14),
          ),
        ),
      );
    }

    return AuthLayout(
      child: _done ? _buildDone(t) : _buildConfirm(t),
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
          t.authFormUndoPasswordChangeSuccess,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 14),
        ),
        const SizedBox(height: 16),
        Text(
          t.authFormUndoPasswordChangeLoginLink,
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 12, color: colors.fgMuted),
        ),
      ],
    );
  }

  Widget _buildConfirm(AppLocalizations t) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          t.authFormUndoPasswordChangeTitle,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: colors.brand,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          t.authFormUndoPasswordChangeDescription,
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 13, color: colors.fgMuted),
        ),
        if (_error != null) ...[
          const SizedBox(height: 12),
          Text(
            _error!,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 14, color: colors.danger),
          ),
        ],
        const SizedBox(height: 16),
        SizedBox(
          height: 36,
          child: Button(
            variant: ButtonVariant.danger,
            fullWidth: true,
            loading: _submitting,
            onPressed: _submitting ? null : _submit,
            child: Text(
              _submitting
                  ? t.authFormUndoPasswordChangeSubmitting
                  : t.authFormUndoPasswordChangeSubmit,
            ),
          ),
        ),
      ],
    );
  }
}
