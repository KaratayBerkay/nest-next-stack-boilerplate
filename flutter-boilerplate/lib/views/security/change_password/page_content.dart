import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../api/client/auth/actions.dart';
import '../../../components/auth/labeled_field.dart';
import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

class ChangePasswordPageContent extends ConsumerStatefulWidget {
  const ChangePasswordPageContent({super.key});

  @override
  ConsumerState<ChangePasswordPageContent> createState() =>
      _ChangePasswordPageContentState();
}

class _ChangePasswordPageContentState
    extends ConsumerState<ChangePasswordPageContent> {
  final _currentPasswordCtrl = TextEditingController();
  final _newPasswordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _submitting = false;
  bool _done = false;
  String? _error;

  @override
  void dispose() {
    _currentPasswordCtrl.dispose();
    _newPasswordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  bool _validate() {
    final t = AppLocalizations.of(context);
    if (_currentPasswordCtrl.text.isEmpty) {
      setState(() => _error = t.authErrorsCurrentPasswordRequired);
      return false;
    }
    final password = _newPasswordCtrl.text;
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
      await actions.changePassword(
        _currentPasswordCtrl.text,
        _newPasswordCtrl.text,
      );
      if (mounted) setState(() => _done = true);
    } on DioException catch (e) {
      final data = e.response?.data;
      final msg =
          (data is Map && data['msg'] is String) ? data['msg'] as String : null;
      setState(() => _error = msg ?? t.securityChangePasswordFailed);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(t.securityChangePassword)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: _done ? _buildDone(t) : _buildForm(t),
      ),
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
          t.securityChangePasswordSuccess,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 14),
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 36,
          child: Button(
            fullWidth: true,
            onPressed: () => Navigator.of(context).pop(),
            child: Text(t.securityDone),
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
          t.securityChangePasswordDescription,
          style: TextStyle(fontSize: 12, color: colors.fgMuted),
        ),
        const SizedBox(height: 16),
        LabeledField(
          label: t.securityCurrentPasswordLabel,
          required: true,
          controller: _currentPasswordCtrl,
          obscureText: true,
          showVisibilityToggle: true,
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: 12),
        LabeledField(
          label: t.securityNewPasswordLabel,
          required: true,
          controller: _newPasswordCtrl,
          obscureText: true,
          showVisibilityToggle: true,
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: 12),
        LabeledField(
          label: t.securityConfirmNewPasswordLabel,
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
        const SizedBox(height: 16),
        SizedBox(
          height: 36,
          child: Button(
            fullWidth: true,
            loading: _submitting,
            onPressed: _submitting ? null : _submit,
            child: Text(
              _submitting
                  ? t.securityChangePasswordSubmitting
                  : t.securityChangePasswordSubmit,
            ),
          ),
        ),
      ],
    );
  }
}
