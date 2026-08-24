import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/activity_logger.dart';
import 'package:flutter_boilerplate/lib/biometric_auth.dart';
import 'package:flutter_boilerplate/lib/i18n/messages_provider.dart';
import 'package:flutter_boilerplate/lib/oauth_link_handler.dart';
import 'package:flutter_boilerplate/lib/riverpod_compat.dart';
import 'package:flutter_boilerplate/lib/stripe_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../app_config.dart';
import '../components/rtc/rtc_call_overlay.dart';
import '../constants/theme.dart';
import '../hooks/use_auth.dart';
import '../hooks/use_biometric.dart';
import '../hooks/use_realtime.dart';
import '../hooks/use_theme.dart';
import '../l10n/app_localizations.dart';
import '../services/push_notification_service.dart';
import 'router.dart';

class FlutterBoilerplateApp extends ConsumerStatefulWidget {
  const FlutterBoilerplateApp({super.key});

  @override
  ConsumerState<FlutterBoilerplateApp> createState() =>
      _FlutterBoilerplateAppState();
}

class _FlutterBoilerplateAppState extends ConsumerState<FlutterBoilerplateApp>
    with WidgetsBindingObserver {
  OAuthLinkHandler? _oauthLinkHandler;
  bool _biometricGatePending = !kIsWeb;
  bool _biometricLocked = false;
  bool _biometricChecked = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initServices();
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _oauthLinkHandler?.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.detached) {
      ActivityLogger.instance.flushNow();
      if (_biometricChecked && !kIsWeb) _lockWithBiometric();
    } else if (state == AppLifecycleState.resumed &&
        _biometricLocked &&
        !kIsWeb) {
      _unlockWithBiometric();
    }
  }

  Future<void> _initServices() async {
    if (kIsWeb) return;

    final biometric = ref.read(biometricProvider);
    final enabled = await biometric.isEnabled();
    if (enabled) {
      _biometricChecked = true;
      await _unlockWithBiometric();
    }
    if (mounted) setState(() => _biometricGatePending = false);

    _oauthLinkHandler = OAuthLinkHandler();
    await _oauthLinkHandler!.init(ref);

    final router = ref.read(routerProvider);

    if (AppConfig.pushEnabled) {
      final pushService = ref.read(pushNotificationProvider);
      pushService.navigateTo = (path) => router.go(path);
      try {
        await pushService.initialize();
      } catch (e) {
        debugPrint('[push] init failed: $e');
      }
    } else {
      debugPrint('[push] disabled via PUSH_ENABLED=false');
    }
  }

  void _lockWithBiometric() {
    setState(() => _biometricLocked = true);
  }

  Future<void> _unlockWithBiometric() async {
    final biometric = ref.read(biometricProvider);
    final success = await biometric.authenticate();
    if (mounted) {
      setState(() => _biometricLocked = !success);
    }
  }

  Future<void> _signOut() async {
    final auth = ref.read(authProvider.notifier);
    await auth.logout();
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final themeMode = ref.watch(themeModeProvider);
    final locale = ref.watch(localeProvider);
    final messages = ref.watch(messagesProvider(locale));

    ref.watch(useRealtimeProvider);
    ref.watch(stripeInitProvider);

    ref.listen(biometricEnabledProvider, (prev, next) {
      final enabled = next.asData?.value ?? false;
      if (enabled && !_biometricChecked) {
        setState(() => _biometricChecked = true);
      }
    });

    if (_biometricGatePending) {
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        home: Container(color: colors.surface),
      );
    }

    Widget app = MaterialApp.router(
      title: 'Flutter Boilerplate',
      debugShowCheckedModeBanner: AppConfig.isDevelopment,
      theme: buildThemeData(themeMode),
      themeMode: ThemeMode.light,
      locale: Locale(locale),
      supportedLocales: const [Locale('en'), Locale('tr')],
      localizationsDelegates: messages,
      routerConfig: ref.watch(routerProvider),
      // Renders inside MaterialApp's own Localizations/Directionality scope
      // (unlike wrapping `app` in an outer Stack, which would make this a
      // sibling with no ancestor to resolve AppLocalizations.of(context)
      // from) — the documented way to lay a global overlay on top of
      // whatever route is active.
      builder: (context, child) => Stack(
        children: [
          if (child != null) child,
          const Positioned.fill(child: RtcCallOverlay()),
        ],
      ),
    );

    if (_biometricLocked) {
      app = Stack(
        children: [
          app,
          Positioned.fill(
            child: _BiometricOverlay(
              onUnlock: _unlockWithBiometric,
              onSignOut: _signOut,
            ),
          ),
        ],
      );
    }

    return app;
  }
}

class _BiometricOverlay extends StatelessWidget {
  final VoidCallback onUnlock;
  final VoidCallback onSignOut;

  const _BiometricOverlay({
    required this.onUnlock,
    required this.onSignOut,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    return Container(
      color: colors.surface,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.fingerprint,
              size: 64,
              color: colors.brand,
            ),
            const SizedBox(height: 16),
            Text(
              t.securityBiometricLockedTitle,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: colors.fg,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              t.securityBiometricLockedSubtitle,
              style: TextStyle(
                fontSize: 14,
                color: colors.fgMuted,
              ),
            ),
            const SizedBox(height: 24),
            IconButton(
              iconSize: 48,
              icon: Icon(Icons.fingerprint, color: colors.brand),
              onPressed: onUnlock,
            ),
            const SizedBox(height: 16),
            TextButton(
              onPressed: onSignOut,
              child: Text(t.biometricSignOutInstead),
            ),
          ],
        ),
      ),
    );
  }
}
