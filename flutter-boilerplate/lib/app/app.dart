import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/i18n/messages_provider.dart';
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

class _FlutterBoilerplateAppState extends ConsumerState<FlutterBoilerplateApp> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initServices();
    });
  }

  Future<void> _initServices() async {
    if (kIsWeb) return;

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

  @override
  Widget build(BuildContext context) {
    final themeMode = ref.watch(themeModeProvider);
    final locale = ref.watch(localeProvider);
    final messages = ref.watch(messagesProvider(locale));

    ref.watch(useRealtimeProvider);
    ref.watch(stripeInitProvider);

    return MaterialApp.router(
      title: 'Flutter Boilerplate',
      debugShowCheckedModeBanner: AppConfig.isDevelopment,
      theme: buildThemeData(themeMode),
      themeMode: ThemeMode.light,
      locale: Locale(locale),
      supportedLocales: const [Locale('en'), Locale('tr')],
      localizationsDelegates: messages,
      routerConfig: ref.watch(routerProvider),
    );
  }
}
