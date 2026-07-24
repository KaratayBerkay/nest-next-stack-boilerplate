import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../api/client/auth/actions.dart';
import '../../../components/auth/auth_layout.dart';
import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

class VerifyEmailPageContent extends ConsumerStatefulWidget {
  final String token;

  const VerifyEmailPageContent({super.key, this.token = ''});

  @override
  ConsumerState<VerifyEmailPageContent> createState() =>
      _VerifyEmailPageContentState();
}

class _VerifyEmailPageContentState
    extends ConsumerState<VerifyEmailPageContent> {
  bool _verifying = true;
  bool _success = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.token.isNotEmpty) {
      _verify();
    } else {
      _verifying = false;
      _error = null;
    }
  }

  Future<void> _verify() async {
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

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final colors = AppColors.of(context);

    Widget body;

    if (widget.token.isEmpty) {
      body = Padding(
        padding: const EdgeInsets.symmetric(vertical: 32),
        child: Text(
          t.authErrorsVerifyEmailTokenMissing,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 14),
        ),
      );
    } else if (_verifying) {
      body = const Padding(
        padding: EdgeInsets.symmetric(vertical: 32),
        child: Center(child: CircularProgressIndicator()),
      );
    } else if (_success) {
      body = Column(
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
    } else {
      body = Padding(
        padding: const EdgeInsets.symmetric(vertical: 32),
        child: Text(
          _error ?? t.authErrorsVerifyEmailFailed,
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 14, color: colors.danger),
        ),
      );
    }

    return AuthLayout(child: body);
  }
}
