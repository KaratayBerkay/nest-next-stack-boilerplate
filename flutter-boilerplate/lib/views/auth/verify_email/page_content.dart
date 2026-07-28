import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../api/client/auth/actions.dart';
import '../../../components/auth/auth_layout.dart';
import '../../../components/ui/button/button.dart';
import '../../../components/ui/input_otp/input_otp.dart';
import '../../../constants/theme.dart';
import '../../../hooks/use_auth.dart';
import '../../../hooks/use_locale.dart';
import '../../../l10n/app_localizations.dart';

class VerifyEmailPageContent extends ConsumerStatefulWidget {
  final String token;
  final String userId;

  const VerifyEmailPageContent({
    super.key,
    this.token = '',
    this.userId = '',
  });

  @override
  ConsumerState<VerifyEmailPageContent> createState() =>
      _VerifyEmailPageContentState();
}

class _VerifyEmailPageContentState
    extends ConsumerState<VerifyEmailPageContent> {
  String _code = '';
  bool _verifying = false;
  bool _success = false;
  bool _resending = false;
  String? _error;

  bool get _hasToken => widget.token.isNotEmpty;
  bool get _codeMode => !_hasToken && widget.userId.isNotEmpty;

  @override
  void dispose() {
    super.dispose();
  }

  Future<void> _verifyWithToken() async {
    final t = AppLocalizations.of(context);

    setState(() {
      _verifying = true;
      _error = null;
    });

    try {
      final actions = ref.read(loginActionsProvider);
      await actions.verifyEmail(widget.token);
      if (mounted) setState(() => _success = true);
    } on DioException catch (e) {
      final data = e.response?.data;
      final msg =
          (data is Map && data['msg'] is String) ? data['msg'] as String : null;
      if (mounted) {
        setState(() => _error = msg ?? t.authErrorsVerifyEmailFailed);
      }
    } finally {
      if (mounted) setState(() => _verifying = false);
    }
  }

  Future<void> _verifyWithCode() async {
    if (_code.length < 6) return;

    final t = AppLocalizations.of(context);

    setState(() {
      _verifying = true;
      _error = null;
    });

    try {
      final actions = ref.read(loginActionsProvider);
      await actions.verifyEmailCode(widget.userId, _code);
      if (mounted) setState(() => _success = true);
    } on DioException catch (e) {
      final data = e.response?.data;
      final msg =
          (data is Map && data['msg'] is String) ? data['msg'] as String : null;
      if (mounted) {
        setState(() => _error = msg ?? t.authErrorsVerifyEmailFailed);
      }
    } finally {
      if (mounted) setState(() => _verifying = false);
    }
  }

  Future<void> _resendCode() async {
    setState(() => _resending = true);
    try {
      final actions = ref.read(loginActionsProvider);
      await actions.resendEmailCode(
        widget.userId,
        ref.read(currentUserProvider)?.email ?? '',
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(AppLocalizations.of(context).authCodeResent)),
        );
      }
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.message ?? 'Failed to resend code'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _resending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final colors = AppColors.of(context);

    Widget body;

    if (_hasToken && !_success && _error == null) {
      _verifyWithToken();
      body = const Padding(
        padding: EdgeInsets.symmetric(vertical: 32),
        child: Center(child: CircularProgressIndicator()),
      );
    } else if (_success) {
      body = _buildSuccess(t);
    } else if (_codeMode) {
      body = _buildCodeEntry(t, colors);
    } else {
      body = _buildError(t, colors);
    }

    return AuthLayout(child: body);
  }

  Widget _buildSuccess(AppLocalizations t) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Icon(Icons.check_circle, color: colors.success, size: 48),
        const SizedBox(height: 16),
        Text(
          t.authFormVerifyEmailSuccess,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 14),
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 36,
          child: Button(
            onPressed: () => context.go('/auth/login'),
            child: Text(t.authFormVerifyEmailLoginLink),
          ),
        ),
      ],
    );
  }

  Widget _buildCodeEntry(AppLocalizations t, AppColors colors) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            t.authFormVerifyEmailTitle,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: colors.brand,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            t.authFormVerifyEmailCodeDescription,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: colors.fgMuted),
          ),
          const SizedBox(height: 24),
          Center(
            child: InputOtp(
              value: _code,
              onChanged: (v) => setState(() => _code = v),
              onCompleted: (_) => _verifyWithCode(),
            ),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(
              _error!,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: colors.danger),
            ),
          ],
          const SizedBox(height: 16),
          SizedBox(
            height: 36,
            child: Button(
              fullWidth: true,
              loading: _verifying,
              onPressed: _verifyWithCode,
              child: Text(t.authFormVerifyEmailVerify),
            ),
          ),
          const SizedBox(height: 12),
          Center(
            child: _resending
                ? SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: colors.brand,
                    ),
                  )
                : GestureDetector(
                    onTap: _resendCode,
                    child: Text(
                      t.authFormVerifyEmailResendCode,
                      style: TextStyle(
                        fontSize: 12,
                        color: colors.brand,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
          ),
          const SizedBox(height: 24),
          Center(
            child: GestureDetector(
              onTap: () {
                final locale = ref.read(localeProvider);
                context.go('/v1/$locale/feed');
              },
              child: Text(
                t.authFormVerifyEmailSkip,
                style: TextStyle(
                  fontSize: 12,
                  color: colors.fgMuted,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildError(AppLocalizations t, AppColors colors) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Column(
        children: [
          if (_verifying)
            const CircularProgressIndicator()
          else
            Text(
              _error ?? t.authErrorsVerifyEmailTokenMissing,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: colors.danger),
            ),
        ],
      ),
    );
  }
}
