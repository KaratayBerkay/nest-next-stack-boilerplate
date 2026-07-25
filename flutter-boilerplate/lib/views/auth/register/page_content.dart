import 'package:dio/dio.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../api/client/auth/actions.dart';
import '../../../components/auth/auth_layout.dart';
import '../../../components/auth/labeled_field.dart';
import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';
import '../../../hooks/use_auth.dart';
import '../../../hooks/use_theme.dart';
import '../../../l10n/app_localizations.dart';
import '../../../types/auth/auth_request_types.dart';

class RegisterPageContent extends ConsumerStatefulWidget {
  const RegisterPageContent({super.key});

  @override
  ConsumerState<RegisterPageContent> createState() =>
      _RegisterPageContentState();
}

class _RegisterPageContentState extends ConsumerState<RegisterPageContent> {
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();

  bool _submitting = false;
  Map<String, String?> _fieldErrors = {};

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
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
    } else if (password.length < 8) {
      _fieldErrors['password'] = t.authErrorsPasswordMin;
      valid = false;
    } else if (password.length > 128) {
      _fieldErrors['password'] = t.authErrorsPasswordMax;
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
      final request = RegisterRequest(
        email: _emailCtrl.text.trim(),
        password: _passwordCtrl.text,
        name: _nameCtrl.text.trim(),
      );
      final response = await actions.register(request);

      await ref.read(authProvider.notifier).setSession(
            response.accessToken,
            response.user,
            rbacToken: response.rbacToken,
            deviceToken: response.deviceToken,
            userToken: response.userToken,
          );

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

  void _handleError(DioException err) {
    final t = AppLocalizations.of(context);
    final data = err.response?.data;
    final msg =
        (data is Map && data['msg'] is String) ? data['msg'] as String : null;
    final field = (data is Map) ? data['field'] as String? : null;
    final exc = (data is Map) ? data['exc'] as String? : null;

    setState(() {
      if (exc == 'EX_AUTH_EMAIL_TAKEN' && field == 'email') {
        _fieldErrors['email'] = t.authErrorsEmailTaken;
      } else if (field != null) {
        _fieldErrors[field] = msg ?? t.authErrorsRegisterFailed;
      } else {
        _fieldErrors['form'] = msg ?? t.authErrorsRegisterFailed;
      }
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
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 32),
              child: Text(
                t.authSignedInAs(user.email),
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 14),
              ),
            );
          }
          return _buildForm(t);
        },
      ),
    );
  }

  Widget _buildForm(AppLocalizations t) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          t.authFormRegisterTitle,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: colors.brand,
          ),
        ),
        const SizedBox(height: 16),
        LabeledField(
          label: t.authFormRegisterNameLabel,
          hint: t.authFormRegisterNamePlaceholder,
          controller: _nameCtrl,
          errorText: _fieldErrors['name'],
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: 12),
        LabeledField(
          label: t.authFormRegisterEmailLabel,
          required: true,
          controller: _emailCtrl,
          keyboardType: TextInputType.emailAddress,
          errorText: _fieldErrors['email'],
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: 12),
        LabeledField(
          label: t.authFormRegisterPasswordLabel,
          required: true,
          controller: _passwordCtrl,
          obscureText: true,
          errorText: _fieldErrors['password'],
          textInputAction: TextInputAction.done,
          onSubmitted: _submit,
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
              _submitting ? t.authLoading : t.authFormRegisterSubmit,
            ),
          ),
        ),
        const SizedBox(height: 16),
        Text.rich(
          TextSpan(
            children: [
              TextSpan(
                text: '${t.authFormRegisterHasAccount} ',
                style: TextStyle(fontSize: 12, color: colors.fgMuted),
              ),
              TextSpan(
                text: t.authFormLoginSubmit,
                style: TextStyle(
                  fontSize: 12,
                  color: colors.brand,
                  decoration: TextDecoration.underline,
                ),
                recognizer: TapGestureRecognizer()
                  ..onTap = () => context.go('/auth/login'),
              ),
            ],
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
