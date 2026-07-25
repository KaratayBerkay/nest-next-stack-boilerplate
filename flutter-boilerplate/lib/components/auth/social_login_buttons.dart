import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/oauth_link_handler.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../api/client/auth/oauth.dart';
import '../../app_config.dart';
import '../../constants/theme.dart';
import '../../hooks/use_auth.dart';
import '../../hooks/use_theme.dart';
import '../../l10n/app_localizations.dart';

class _ProviderInfo {
  final String name;
  final String label;
  const _ProviderInfo(this.name, this.label);
}

class _ProviderStyle {
  final Color bg;
  final Color fg;
  const _ProviderStyle({required this.bg, required this.fg});
}

const _allProviders = [
  _ProviderInfo('google', 'Google'),
  _ProviderInfo('github', 'GitHub'),
  _ProviderInfo('linkedin', 'LinkedIn'),
  _ProviderInfo('huggingface', 'Hugging Face'),
  _ProviderInfo('twitch', 'Twitch'),
  _ProviderInfo('x', 'X'),
];

const _providerStyles = {
  'google': _ProviderStyle(bg: Colors.white, fg: Color(0xFF1F2937)),
  'github': _ProviderStyle(bg: Color(0xFF1F2937), fg: Colors.white),
  'linkedin': _ProviderStyle(bg: Color(0xFF0A66C2), fg: Colors.white),
  'huggingface': _ProviderStyle(bg: Color(0xFFFFD21E), fg: Color(0xFF111827)),
  'twitch': _ProviderStyle(bg: Color(0xFF9146FF), fg: Colors.white),
  'x': _ProviderStyle(bg: Color(0xFF000000), fg: Colors.white),
};

String _providerSvg(String provider) {
  switch (provider) {
    case 'google':
      return '''
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ''';
    case 'github':
      return '''
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
        </svg>
      ''';
    case 'linkedin':
      return '''
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ''';
    case 'huggingface':
      return '''
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-2.5 7.5c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zm5 0c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zm-5.5 5c0-1.5 1.5-3 4-3s4 1.5 4 3H9z"/>
        </svg>
      ''';
    case 'twitch':
      return '''
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="currentColor" d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
        </svg>
      ''';
    case 'x':
      return '''
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ''';
    default:
      return '';
  }
}

String _generateState() {
  final random = Random.secure();
  final bytes = List<int>.generate(32, (_) => random.nextInt(256));
  return base64Url.encode(bytes);
}

class SocialLoginButtons extends ConsumerWidget {
  const SocialLoginButtons({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);

    return Column(
      children: [
        Row(
          children: [
            Expanded(child: Divider(color: AppColors.of(context).border)),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Text(
                t.authSocialContinueWith,
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.of(context).fgMuted,
                ),
              ),
            ),
            Expanded(child: Divider(color: AppColors.of(context).border)),
          ],
        ),
        const SizedBox(height: 12),
        ..._allProviders.map(
          (p) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: _SocialLoginButton(
              provider: p.name,
              label: p.label,
            ),
          ),
        ),
      ],
    );
  }
}

class _SocialLoginButton extends ConsumerStatefulWidget {
  final String provider;
  final String label;

  const _SocialLoginButton({
    required this.provider,
    required this.label,
  });

  @override
  ConsumerState<_SocialLoginButton> createState() => _SocialLoginButtonState();
}

class _SocialLoginButtonState extends ConsumerState<_SocialLoginButton> {
  bool _loading = false;

  Future<void> _handleOAuth() async {
    setState(() => _loading = true);

    try {
      final state = _generateState();
      const callbackUri = 'flutterboilerplate://oauth/callback';
      const backendUrl = AppConfig.apiBaseUrl;
      final url = '$backendUrl/auth/oauth/${widget.provider}'
          '?state=$state&redirect_uri=${Uri.encodeComponent(callbackUri)}';

      final completer = Completer<String>();
      ref.read(pendingOAuthProvider.notifier).state = PendingOAuth(
        state: state,
        provider: widget.provider,
        completer: completer,
      );

      final uri = Uri.parse(url);
      if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
        ref.read(pendingOAuthProvider.notifier).state = null;
        if (!mounted) return;
        final t = AppLocalizations.of(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(t.authSocialError)),
        );
        return;
      }

      String? resultState;
      try {
        resultState = await completer.future.timeout(
          const Duration(minutes: 5),
        );
      } on TimeoutException {
        ref.read(pendingOAuthProvider.notifier).state = null;
      }

      if (resultState == null || !mounted) return;

      final actions = ref.read(oauthActionsProvider);
      final profile = await actions.getProfile(widget.provider, resultState);
      final authResult = await actions.loginWithOAuth(profile);

      await ref.read(authProvider.notifier).setSession(
            authResult.accessToken,
            authResult.user,
            rbacToken: authResult.rbacToken,
            deviceToken: authResult.deviceToken,
            userToken: authResult.userToken,
          );

      if (mounted) {
        final locale = ref.read(localeProvider);
        context.go('/v1/$locale/feed');
      }
    } on DioException catch (e) {
      if (!mounted) return;
      final t = AppLocalizations.of(context);
      final msg = e.message?.isNotEmpty == true
          ? e.message
          : (e.response?.data is Map
              ? (e.response!.data as Map)['msg'] as String?
              : null);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(msg ?? t.authSocialError)),
      );
    } catch (_) {
      if (!mounted) return;
      final t = AppLocalizations.of(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(t.authSocialError)),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final style = _providerStyles[widget.provider] ??
        const _ProviderStyle(bg: Color(0xFF1F2937), fg: Colors.white);
    final colors = AppColors.of(context);
    final svgString = _providerSvg(widget.provider);

    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: _loading ? null : _handleOAuth,
        icon: svgString.isNotEmpty
            ? SvgPicture.string(
                svgString,
                width: 18,
                height: 18,
                colorFilter: widget.provider == 'google'
                    ? null
                    : ColorFilter.mode(style.fg, BlendMode.srcIn),
              )
            : const SizedBox(width: 18, height: 18),
        label: Text(
          widget.label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: widget.provider == 'google' ? colors.fg : style.fg,
          ),
        ),
        style: OutlinedButton.styleFrom(
          backgroundColor: style.bg,
          foregroundColor: style.fg,
          side: BorderSide(
            color: widget.provider == 'google' ? colors.border : style.bg,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          disabledBackgroundColor: style.bg.withValues(alpha: 0.6),
        ),
      ),
    );
  }
}
