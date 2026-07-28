import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../api/client/auth/actions.dart';
import '../../../api/server/sessions/trust_device.dart';
import '../../../components/auth/auth_layout.dart';
import '../../../components/auth/labeled_field.dart';
import '../../../components/auth/link_text.dart';
import '../../../components/auth/social_login_buttons.dart';
import '../../../components/ui/button/button.dart';
import '../../../components/ui/input_otp/input_otp.dart';
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
  String? _mfaMethod;
  bool _resending = false;
  bool _backupCodeMode = false;
  bool _trustDevice = false;
  String _mfaOtpCode = '';
  int _cooldownRemaining = 0;
  Timer? _cooldownTimer;
  Map<String, String?> _fieldErrors = {};

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _mfaCodeCtrl.dispose();
    _cooldownTimer?.cancel();
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
          await ref.read(authProvider.notifier).setSession(
                response.accessToken,
                response.user,
                rbacToken: response.rbacToken,
                deviceToken: response.deviceToken,
                userToken: response.userToken,
              );
          final rt = response.refreshToken;
          if (rt != null) {
            await ref.read(authProvider.notifier).setRefreshToken(rt);
          }
          if (mounted) {
            final locale = ref.read(localeProvider);
            context.go('/v1/$locale/feed');
          }
        case LoginMfaRequired(:final mfaToken, :final mfaMethod):
          setState(() {
            _mfaMode = true;
            _mfaToken = mfaToken;
            _mfaMethod = mfaMethod;
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

    String? msg;
    String? field;
    if (data is Map) {
      final errors = data['errors'];
      if (errors is List && errors.isNotEmpty && errors.first is Map) {
        final first = errors.first as Map;
        msg = first['message'] as String?;
        final extensions = first['extensions'];
        if (extensions is Map) {
          field = extensions['field'] as String?;
        }
      }
      msg ??= data['msg'] as String?;
      field ??= data['field'] as String?;
    }

    setState(() {
      if (field != null) {
        _fieldErrors[field] = msg ?? t.authErrorsLoginFailed;
      } else {
        _fieldErrors['form'] = msg ?? t.authErrorsLoginFailed;
      }
    });
  }

  void _startCooldown() {
    const duration = 60;
    _cooldownRemaining = duration;
    _cooldownTimer?.cancel();
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      setState(() {
        _cooldownRemaining--;
        if (_cooldownRemaining <= 0) {
          _cooldownTimer?.cancel();
          _cooldownRemaining = 0;
        }
      });
    });
  }

  Future<void> _verifyMfa() async {
    final code = _backupCodeMode ? _mfaCodeCtrl.text.trim() : _mfaOtpCode;
    final t = AppLocalizations.of(context);

    final minLen = _backupCodeMode ? 6 : 6;
    final maxLen = _backupCodeMode ? 10 : 6;
    if (code.length < minLen || code.length > maxLen) {
      setState(() {
        _fieldErrors['mfa'] = t.authFormLoginMfaCodeLengthError;
      });
      return;
    }

    setState(() => _submitting = true);

    try {
      final actions = ref.read(loginActionsProvider);
      final data = await actions.verifyLoginMfa(_mfaToken!, code);
      final response = LoginResponse.fromJson(data);

      await ref.read(authProvider.notifier).setSession(
            response.accessToken,
            response.user,
            rbacToken: response.rbacToken,
            deviceToken: response.deviceToken,
            userToken: response.userToken,
          );
      final rt = response.refreshToken;
      if (rt != null) {
        await ref.read(authProvider.notifier).setRefreshToken(rt);
      }

      if (_trustDevice) {
        try {
          await ref.read(trustDeviceServerProvider).call();
        } catch (_) {
          // Non-fatal — login already succeeded.
        }
      }

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

  Future<void> _resendCode() async {
    if (_mfaToken == null) return;
    setState(() => _resending = true);
    try {
      final actions = ref.read(loginActionsProvider);
      final newToken = await actions.resendLoginCode(_mfaToken!);
      if (mounted) {
        setState(() {
          _mfaToken = newToken;
          _mfaOtpCode = '';
        });
        _startCooldown();
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

  void _resetMfa() {
    setState(() {
      _mfaMode = false;
      _mfaToken = null;
      _mfaMethod = null;
      _mfaCodeCtrl.clear();
      _mfaOtpCode = '';
      _fieldErrors = {};
      _backupCodeMode = false;
      _trustDevice = false;
      _cooldownTimer?.cancel();
      _cooldownRemaining = 0;
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
    final isEmailMethod = _mfaMethod == 'EMAIL';
    final description = isEmailMethod
        ? t.authFormLoginMfaEmailDescription
        : t.authFormLoginMfaDescription;

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
          description,
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 12, color: colors.fgMuted),
        ),
        const SizedBox(height: 16),
        if (_backupCodeMode)
          LabeledField(
            label: t.authFormLoginMfaCodeLabel,
            hint: t.authFormLoginMfaCodePlaceholder,
            controller: _mfaCodeCtrl,
            keyboardType: TextInputType.text,
            autofocus: true,
            maxLength: 10,
            inputFormatters: [
              FilteringTextInputFormatter.allow(RegExp(r'[a-fA-F0-9]')),
            ],
            errorText: _fieldErrors['mfa'],
            textInputAction: TextInputAction.done,
            onSubmitted: _verifyMfa,
          )
        else
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                t.authFormLoginMfaCodeLabel,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: colors.fg,
                ),
              ),
              const SizedBox(height: 6),
              Center(
                child: InputOtp(
                  value: _mfaOtpCode,
                  onChanged: (v) => setState(() => _mfaOtpCode = v),
                  onCompleted: (_) => _verifyMfa(),
                ),
              ),
              if (_fieldErrors['mfa'] != null) ...[
                const SizedBox(height: 6),
                Text(
                  _fieldErrors['mfa']!,
                  style: TextStyle(fontSize: 12, color: colors.danger),
                ),
              ],
            ],
          ),
        if (_fieldErrors['form'] != null) ...[
          const SizedBox(height: 12),
          Text(
            _fieldErrors['form']!,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 14, color: colors.danger),
          ),
        ],
        if (_mfaMethod == 'TOTP') ...[
          const SizedBox(height: 8),
          Center(
            child: LinkText(
              _backupCodeMode
                  ? t.authFormLoginMfaUseCode
                  : t.authFormLoginMfaUseBackupCode,
              onTap: () {
                setState(() {
                  _backupCodeMode = !_backupCodeMode;
                  _mfaCodeCtrl.clear();
                  _fieldErrors = {};
                });
              },
            ),
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
        if (isEmailMethod) ...[
          const SizedBox(height: 8),
          Center(
            child: _cooldownRemaining > 0
                ? Text(
                    t.authFormLoginMfaResendCooldown('$_cooldownRemaining'),
                    style: TextStyle(fontSize: 12, color: colors.fgMuted),
                  )
                : _resending
                    ? SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: colors.brand,
                        ),
                      )
                    : LinkText(
                        t.authFormLoginMfaResendCode,
                        onTap: _resendCode,
                      ),
          ),
        ],
        const SizedBox(height: 8),
        Row(
          children: [
            Checkbox(
              value: _trustDevice,
              onChanged: (v) => setState(() => _trustDevice = v ?? false),
            ),
            GestureDetector(
              onTap: () => setState(() => _trustDevice = !_trustDevice),
              child: Text(
                t.authFormLoginMfaTrustDevice,
                style: TextStyle(fontSize: 12, color: colors.fg),
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
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
