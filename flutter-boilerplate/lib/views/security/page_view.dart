import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_boilerplate/lib/biometric_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/auth/actions.dart';
import '../../components/ui/button/button.dart';
import '../../constants/theme.dart';
import '../../hooks/use_auth.dart';
import '../../hooks/use_biometric.dart';
import '../../l10n/app_localizations.dart';

import '../../types/auth/user.dart';
import '../settings/settings_shell.dart';
import 'mfa_enroll/page_content.dart';

class SecurityPageContent extends ConsumerWidget {
  final String lang;

  const SecurityPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final colors = AppColors.of(context);
    final user = ref.watch(currentUserProvider);

    final biometricAvailable = ref.watch(biometricAvailableProvider);
    final biometricEnabled = ref.watch(biometricEnabledProvider);
    final bioAvail = biometricAvailable.asData?.value ?? false;
    final bioEnabled = biometricEnabled.asData?.value ?? false;

    return SettingsShellScaffold(
      lang: lang,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Column(
              children: [
                _MfaTile(user: user),
                if (bioAvail) ...[
                  const Divider(height: 1),
                  _BiometricTile(enabled: bioEnabled),
                ],
                const Divider(height: 1),
                ListTile(
                  title: Text(t.securityChangePassword),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(t.securityChangePasswordComingSoon)),
                  ),
                ),
                const Divider(height: 1),
                ListTile(
                  title: Text(t.securityActiveSessions),
                  subtitle: Text(
                    'Manage your logged-in devices',
                    style: TextStyle(color: colors.fgMuted, fontSize: 12),
                  ),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.go('/v1/$lang/settings/sessions'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MfaTile extends ConsumerWidget {
  final AuthenticatedUser? user;

  const _MfaTile({this.user});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final colors = AppColors.of(context);
    final isEnabled = user?.mfaEnabled ?? false;

    return SwitchListTile(
      title: Text(t.securityTwoFactor),
      subtitle: Text(
        isEnabled
            ? t.securityTwoFactorEnabledSubtitle
            : t.securityTwoFactorDisabledSubtitle,
        style: TextStyle(color: colors.fgMuted, fontSize: 12),
      ),
      value: isEnabled,
      onChanged: (value) {
        if (value) {
          _startEnrollment(context, ref);
        } else {
          _showDisableDialog(context, ref);
        }
      },
    );
  }

  Future<void> _startEnrollment(BuildContext context, WidgetRef ref) async {
    await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => const MfaEnrollPageContent(),
      ),
    );
  }

  Future<void> _showDisableDialog(
    BuildContext context,
    WidgetRef ref,
  ) async {
    final t = AppLocalizations.of(context);
    final codeCtrl = TextEditingController();

    final confirmed = await showDialog<String?>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(t.securityDisableTwoFactor),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(t.securityDisableMfaDescription),
            const SizedBox(height: 16),
            TextField(
              controller: codeCtrl,
              keyboardType: TextInputType.number,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(6),
              ],
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 20, letterSpacing: 6),
              decoration: InputDecoration(
                hintText: '000000',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(t.formsApiKeyCancel),
          ),
          Button(
            onPressed: () {
              final code = codeCtrl.text.trim();
              if (code.length >= 6) Navigator.of(ctx).pop(code);
            },
            child: Text(t.securityDisable),
          ),
        ],
      ),
    );

    if (confirmed != null && confirmed.length >= 6) {
      try {
        final actions = ref.read(loginActionsProvider);
        await actions.disableMfa(confirmed);
        final currentUser = ref.read(currentUserProvider);
        if (currentUser != null) {
          await ref
              .read(authProvider.notifier)
              .updateUser(currentUser.copyWith(mfaEnabled: false));
        }
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(t.securityMfaDisabled)),
          );
        }
      } on DioException catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(e.message ?? t.securityMfaDisableFailed),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }
}

class _BiometricTile extends ConsumerWidget {
  final bool enabled;

  const _BiometricTile({required this.enabled});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final colors = AppColors.of(context);

    return SwitchListTile(
      title: Text(t.securityBiometric),
      subtitle: Text(
        enabled
            ? t.securityBiometricEnabledSubtitle
            : t.securityBiometricDisabledSubtitle,
        style: TextStyle(color: colors.fgMuted, fontSize: 12),
      ),
      value: enabled,
      onChanged: (value) async {
        if (value) {
          final biometric = ref.read(biometricProvider);
          final success = await biometric.authenticate(
            reason: 'Enable biometric unlock',
          );
          if (success) {
            await biometric.setEnabled(true);
            ref.invalidate(biometricEnabledProvider);
          }
        } else {
          final biometric = ref.read(biometricProvider);
          await biometric.setEnabled(false);
          ref.invalidate(biometricEnabledProvider);
        }
      },
    );
  }
}
