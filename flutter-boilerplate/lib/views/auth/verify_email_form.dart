import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/auth/actions.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';

class VerifyEmailForm extends ConsumerStatefulWidget {
  final String? token;

  const VerifyEmailForm({super.key, this.token});

  @override
  ConsumerState<VerifyEmailForm> createState() => _VerifyEmailFormState();
}

class _VerifyEmailFormState extends ConsumerState<VerifyEmailForm> {
  String _status = 'verifying';
  String? _errorMsg;

  @override
  void initState() {
    super.initState();
    if (widget.token != null) {
      _verify();
    } else {
      setState(() {
        _status = 'error';
        _errorMsg = 'Missing verification token';
      });
    }
  }

  Future<void> _verify() async {
    try {
      await ref.read(loginActionsProvider).verifyEmail(widget.token!);
      if (mounted) setState(() => _status = 'success');
    } catch (err) {
      if (mounted) {
        setState(() {
          _status = 'error';
          _errorMsg = err.toString();
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    return Column(
      children: [
        Text(
          t.authFormVerifyEmailTitle,
          style: TextStyle(color: colors.brand, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 12),
        if (_status == 'verifying')
          Column(
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 8),
              Text(
                t.authFormVerifyEmailVerifying,
                style: TextStyle(color: colors.fgMuted, fontSize: 12),
              ),
            ],
          )
        else if (_status == 'success')
          Column(
            children: [
              Text(
                t.authFormVerifyEmailSuccess,
                style: TextStyle(color: colors.success, fontSize: 14),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => context.go('/auth/login'),
                child: Text(t.authFormVerifyEmailLoginLink),
              ),
            ],
          )
        else
          Text(
            _errorMsg ?? t.authErrorsVerifyEmailFailed,
            style: TextStyle(color: colors.danger, fontSize: 14),
          ),
      ],
    );
  }
}
