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
import '../constants/theme.dart';
import '../hooks/use_realtime.dart';
import '../hooks/use_theme.dart';
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

    final biometric = ref.read(biometricProvider);
    final enabled = await biometric.isEnabled();
    if (enabled) {
      _biometricChecked = true;
      if (mounted) _unlockWithBiometric();
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

  @override
  Widget build(BuildContext context) {
    final themeMode = ref.watch(themeModeProvider);
    final locale = ref.watch(localeProvider);
    final messages = ref.watch(messagesProvider(locale));

    ref.watch(useRealtimeProvider);
    ref.watch(stripeInitProvider);

    Widget app = MaterialApp.router(
      title: 'Flutter Boilerplate',
      debugShowCheckedModeBanner: AppConfig.isDevelopment,
      theme: buildThemeData(themeMode),
      themeMode: ThemeMode.light,
      locale: Locale(locale),
      supportedLocales: const [Locale('en'), Locale('tr')],
      localizationsDelegates: messages,
      routerConfig: ref.watch(routerProvider),
    );

    if (_biometricLocked) {
      app = Stack(
        children: [
          app,
          Positioned.fill(
            child: _BiometricOverlay(onUnlock: _unlockWithBiometric),
          ),
        ],
      );
    }

    return app;
  }
}

class _BiometricOverlay extends StatelessWidget {
  final VoidCallback onUnlock;

  const _BiometricOverlay({required this.onUnlock});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

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
              'App Locked',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: colors.fg,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Authenticate to access the app',
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
          ],
        ),
      ),
    );
  }
}
