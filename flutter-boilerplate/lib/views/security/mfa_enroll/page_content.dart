import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../../../api/client/auth/actions.dart';
import '../../../components/ui/button/button.dart';
import '../../../components/ui/spinner/spinner.dart';
import '../../../constants/theme.dart';
import '../../../hooks/use_auth.dart';
import '../../../l10n/app_localizations.dart';
import '../../../types/auth/mfa_types.dart';

enum _EnrollStep { qrCode, verify, backupCodes }

class MfaEnrollPageContent extends ConsumerStatefulWidget {
  const MfaEnrollPageContent({super.key});

  @override
  ConsumerState<MfaEnrollPageContent> createState() =>
      _MfaEnrollPageContentState();
}

class _MfaEnrollPageContentState extends ConsumerState<MfaEnrollPageContent> {
  _EnrollStep _step = _EnrollStep.qrCode;
  EnrollMfaResponse? _enrollData;
  VerifyMfaResponse? _verifyData;
  final _codeCtrl = TextEditingController();
  bool _loading = false;
  bool _codesSaved = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _startEnrollment();
  }

  @override
  void dispose() {
    _codeCtrl.dispose();
    super.dispose();
  }

  Future<void> _startEnrollment() async {
    setState(() => _loading = true);
    try {
      final actions = ref.read(loginActionsProvider);
      final data = await actions.enrollMfa();
      setState(() {
        _enrollData = data;
        _loading = false;
      });
    } on DioException catch (e) {
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  Future<void> _verifyCode() async {
    final code = _codeCtrl.text.trim();
    if (code.length < 6) return;

    setState(() => _loading = true);
    try {
      final actions = ref.read(loginActionsProvider);
      final data = await actions.verifyMfa(code);
      setState(() {
        _verifyData = data;
        _step = _EnrollStep.backupCodes;
        _loading = false;
      });
    } on DioException catch (e) {
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  Future<void> _confirmComplete() async {
    final user = ref.read(currentUserProvider);
    if (user != null) {
      await ref.read(authProvider.notifier).updateUser(
            user.copyWith(mfaEnabled: true),
          );
    }
    if (mounted) context.pop(true);
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(t.securitySetupTwoFactor)),
      body: _loading && _enrollData == null
          ? const Center(child: Spinner())
          : _error != null
              ? Center(child: Text(_error!))
              : _buildBody(t),
    );
  }

  Widget _buildBody(AppLocalizations t) {
    switch (_step) {
      case _EnrollStep.qrCode:
        return _buildQrStep(t);
      case _EnrollStep.verify:
        return _buildVerifyStep(t);
      case _EnrollStep.backupCodes:
        return _buildBackupCodesStep(t);
    }
  }

  Widget _buildQrStep(AppLocalizations t) {
    final colors = AppColors.of(context);
    final data = _enrollData!;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Text(
            t.securityScanQrTitle,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: colors.fg,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            t.securityScanQrDescription,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 14, color: colors.fgMuted),
          ),
          const SizedBox(height: 24),
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: QrImageView(
              data: data.otpauthUrl,
              size: 240,
              eyeStyle: QrEyeStyle(
                eyeShape: QrEyeShape.square,
                color: colors.fg,
              ),
              dataModuleStyle: QrDataModuleStyle(
                dataModuleShape: QrDataModuleShape.square,
                color: colors.fg,
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            t.securityManualEntryKey,
            style: TextStyle(fontSize: 12, color: colors.fgMuted),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: colors.surfaceAlt,
              borderRadius: BorderRadius.circular(8),
            ),
            child: SelectableText(
              data.secret,
              style: TextStyle(
                fontSize: 14,
                fontFamily: 'monospace',
                letterSpacing: 2,
                color: colors.fg,
              ),
            ),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            height: 40,
            child: Button(
              onPressed: () => setState(() => _step = _EnrollStep.verify),
              child: Text(t.securityContinue),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVerifyStep(AppLocalizations t) {
    final colors = AppColors.of(context);

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Text(
            t.securityVerifyCodeTitle,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: colors.fg,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            t.securityVerifyCodeDescription,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 14, color: colors.fgMuted),
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _codeCtrl,
            keyboardType: TextInputType.number,
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
              LengthLimitingTextInputFormatter(6),
            ],
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 24, letterSpacing: 8),
            decoration: InputDecoration(
              hintText: '000000',
              errorText: _error,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            onSubmitted: (_) => _verifyCode(),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 40,
            child: Button(
              loading: _loading,
              onPressed: _verifyCode,
              child: Text(t.securityVerify),
            ),
          ),
          const SizedBox(height: 12),
          TextButton(
            onPressed: _startEnrollment,
            child: Text(
              t.securityRegenerateQr,
              style: TextStyle(color: colors.brand),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBackupCodesStep(AppLocalizations t) {
    final colors = AppColors.of(context);
    final codes = _verifyData!.backupCodes;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Icon(Icons.check_circle, size: 48, color: colors.success),
          const SizedBox(height: 16),
          Text(
            t.securityTwoFactorEnabled,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: colors.fg,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            t.securitySaveBackupCodes,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 14, color: colors.fgMuted),
          ),
          const SizedBox(height: 24),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: colors.surfaceAlt,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              children: [
                for (var i = 0; i < codes.length; i++) ...[
                  if (i > 0) const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        '${(i + 1).toString().padLeft(2, '0')}.',
                        style: TextStyle(
                          fontSize: 14,
                          fontFamily: 'monospace',
                          color: colors.fgMuted,
                        ),
                      ),
                      const SizedBox(width: 8),
                      SelectableText(
                        codes[i],
                        style: TextStyle(
                          fontSize: 14,
                          fontFamily: 'monospace',
                          letterSpacing: 2,
                          color: colors.fg,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),
          CheckboxListTile(
            value: _codesSaved,
            onChanged: (v) => setState(() => _codesSaved = v ?? false),
            title: Text(
              t.securityConfirmCodesSaved,
              style: TextStyle(fontSize: 14, color: colors.fg),
            ),
            controlAffinity: ListTileControlAffinity.leading,
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 40,
            child: Button(
              disabled: !_codesSaved,
              onPressed: _codesSaved ? _confirmComplete : null,
              child: Text(t.securityDone),
            ),
          ),
        ],
      ),
    );
  }
}
