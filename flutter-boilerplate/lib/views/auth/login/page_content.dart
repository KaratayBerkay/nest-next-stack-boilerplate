import 'package:dio/dio.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../api/client/auth/actions.dart';
import '../../../components/auth/auth_layout.dart';
import '../../../components/auth/labeled_field.dart';
import '../../../components/auth/link_text.dart';
import '../../../components/auth/social_login_buttons.dart';
import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';
import '../../../hooks/use_auth.dart';
import '../../../hooks/use_theme.dart';
import '../../../l10n/app_localizations.dart';
import '../../../types/auth/auth_request_types.dart';
import '../../../types/auth/user.dart';

class LoginPageContent extends ConsumerStatefulWidget {
  const LoginPageContent({super.key});

  @override
  ConsumerState<LoginPageContent> createState() => _LoginPageContentState();
}

class _LoginPageContentState extends ConsumerState<LoginPageContent> {
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _mfaCodeCtrl = TextEditingController();

  bool _submitting = false;
  bool _mfaMode = false;
  String? _mfaToken;
  Map<String, String?> _fieldErrors = {};

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _mfaCodeCtrl.dispose();
    super.dispose();
  }

  void _clearErrors() {
    setState(() => _fieldErrors = {});
  }

  bool _validate() {
    _clearErrors();
    final email = _emailCtrl.text.trim();
    final password = _passwordCtrl.text;
    final t = AppLocalizations.of(context);
    bool valid = true;

    if (email.isEmpty) {
      _fieldErrors['email'] = t.authErrorsEmailRequired;
      valid = false;
    } else if (!RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        .hasMatch(email)) {
      _fieldErrors['email'] = t.authErrorsEmailInvalid;
      valid = false;
    }

    if (password.isEmpty) {
      _fieldErrors['password'] = t.authErrorsPasswordRequired;
      valid = false;
    }

    setState(() {});
    return valid;
  }

  Future<void> _submit() async {
    if (!_validate()) return;

    setState(() => _submitting = true);

    try {
      final actions = ref.read(loginActionsProvider);
      final request = LoginRequest(
        email: _emailCtrl.text.trim(),
        password: _passwordCtrl.text,
      );
      final result = await actions.login(request);

      switch (result) {
        case LoginSuccess(:final response):
          await ref
              .read(authProvider.notifier)
              .setSession(response.accessToken, response.user);
          if (mounted) {
            final locale = ref.read(localeProvider);
            context.go('/v1/$locale/feed');
          }
        case LoginMfaRequired(:final mfaToken):
          setState(() {
            _mfaMode = true;
            _mfaToken = mfaToken;
          });
      }
    } on DioException catch (e) {
      _handleError(e);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _handleError(DioException err) {
    final t = AppLocalizations.of(context);
    final data = err.response?.data;
    final msg =
        (data is Map && data['msg'] is String) ? data['msg'] as String : null;
    final field = (data is Map) ? data['field'] as String? : null;

    setState(() {
      if (field != null) {
        _fieldErrors[field] = msg ?? t.authErrorsLoginFailed;
      } else {
        _fieldErrors['form'] = msg ?? t.authErrorsLoginFailed;
      }
    });
  }

  Future<void> _verifyMfa() async {
    final code = _mfaCodeCtrl.text.trim();
    final t = AppLocalizations.of(context);

    if (code.length < 6) {
      setState(() {
        _fieldErrors['mfa'] = t.authFormLoginMfaCodeLengthError;
      });
      return;
    }

    setState(() => _submitting = true);

    try {
      final actions = ref.read(loginActionsProvider);
      final data = await actions.loginMfa(_mfaToken!, code);
      final response = LoginResponse.fromJson(data);

      await ref
          .read(authProvider.notifier)
          .setSession(response.accessToken, response.user);

      if (mounted) {
        final locale = ref.read(localeProvider);
        context.go('/v1/$locale/feed');
      }
    } on DioException catch (e) {
      _handleError(e);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _resetMfa() {
    setState(() {
      _mfaMode = false;
      _mfaToken = null;
      _mfaCodeCtrl.clear();
      _fieldErrors = {};
    });
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final authState = ref.watch(authProvider);

    return AuthLayout(
      child: authState.when(
        loading: () => const Padding(
          padding: EdgeInsets.symmetric(vertical: 32),
          child: Center(child: Text('', style: TextStyle(fontSize: 14))),
        ),
        error: (err, _) => Center(
          child: Text(err.toString(), style: const TextStyle(fontSize: 14)),
        ),
        data: (user) {
          if (user != null) {
            return _buildSignedIn(t, user);
          }
          if (_mfaMode) {
            return _buildMfaState(t);
          }
          return _buildForm(t);
        },
      ),
    );
  }

  Widget _buildSignedIn(AppLocalizations t, AuthenticatedUser user) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Text(
        t.authSignedInAs(user.email),
        textAlign: TextAlign.center,
        style: const TextStyle(fontSize: 14),
      ),
    );
  }

  Widget _buildForm(AppLocalizations t) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          t.authFormLoginTitle,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: colors.brand,
          ),
        ),
        const SizedBox(height: 16),
        LabeledField(
          label: t.authFormLoginEmailLabel,
          required: true,
          hint: t.authFormLoginEmailPlaceholder,
          controller: _emailCtrl,
          keyboardType: TextInputType.emailAddress,
          errorText: _fieldErrors['email'],
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: 12),
        LabeledField(
          label: t.authFormLoginPasswordLabel,
          required: true,
          controller: _passwordCtrl,
          obscureText: true,
          errorText: _fieldErrors['password'],
          textInputAction: TextInputAction.done,
          onSubmitted: _submit,
        ),
        const SizedBox(height: 8),
        Align(
          alignment: Alignment.centerLeft,
          child: LinkText(
            t.authFormLoginForgotPassword,
            onTap: () => context.go('/auth/forgot-password'),
          ),
        ),
        if (_fieldErrors['form'] != null) ...[
          const SizedBox(height: 12),
          Text(
            _fieldErrors['form']!,
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
              _submitting ? t.authFormLoginSubmitting : t.authFormLoginSubmit,
            ),
          ),
        ),
        const SizedBox(height: 20),
        const SocialLoginButtons(),
        const SizedBox(height: 16),
        Text.rich(
          TextSpan(
            children: [
              TextSpan(
                text: '${t.authFormLoginNoAccount} ',
                style: TextStyle(fontSize: 12, color: colors.fgMuted),
              ),
              TextSpan(
                text: t.authFormLoginRegisterLink,
                style: TextStyle(
                  fontSize: 12,
                  color: colors.brand,
                  decoration: TextDecoration.underline,
                ),
                recognizer: TapGestureRecognizer()
                  ..onTap = () => context.go('/auth/register'),
              ),
            ],
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildMfaState(AppLocalizations t) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          t.authFormLoginMfaTitle,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: colors.brand,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          t.authFormLoginMfaDescription,
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 12, color: colors.fgMuted),
        ),
        const SizedBox(height: 16),
        LabeledField(
          label: t.authFormLoginMfaCodeLabel,
          hint: t.authFormLoginMfaCodePlaceholder,
          controller: _mfaCodeCtrl,
          keyboardType: TextInputType.number,
          autofocus: true,
          maxLength: 6,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          errorText: _fieldErrors['mfa'],
          textInputAction: TextInputAction.done,
          onSubmitted: _verifyMfa,
        ),
        if (_fieldErrors['form'] != null) ...[
          const SizedBox(height: 12),
          Text(
            _fieldErrors['form']!,
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
            onPressed: _submitting ? null : _verifyMfa,
            child: Text(
              _submitting
                  ? t.authFormLoginMfaVerifying
                  : t.authFormLoginMfaVerify,
            ),
          ),
        ),
        const SizedBox(height: 12),
        Center(
          child: LinkText(
            t.authFormLoginDifferentAccount,
            onTap: _resetMfa,
          ),
        ),
      ],
    );
  }
}
