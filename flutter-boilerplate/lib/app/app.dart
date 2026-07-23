import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../lib/riverpod_compat.dart';
import '../lib/stripe_provider.dart';
import '../lib/i18n/messages_provider.dart';
import '../services/push_notification_service.dart';

import '../app_config.dart';
import '../constants/theme.dart';

import '../hooks/use_locale.dart';
import '../hooks/use_realtime.dart';
import '../hooks/use_theme.dart';
import 'router.dart';

class FlutterBoilerplateApp extends ConsumerStatefulWidget {
  const FlutterBoilerplateApp({super.key});

  @override
  ConsumerState<FlutterBoilerplateApp> createState() => _FlutterBoilerplateAppState();
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
    final router = ref.read(routerProvider);
    final pushService = ref.read(pushNotificationProvider);

    pushService.navigateTo = (path) => router.go(path);

    try {
      await pushService.initialize();
    } catch (_) {}
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
      theme: buildThemeData(AppThemeMode.light),
      darkTheme: buildThemeData(AppThemeMode.dark),
      themeMode: themeMode == AppThemeMode.dark ? ThemeMode.dark : ThemeMode.light,
      locale: Locale(locale),
      supportedLocales: const [Locale('en'), Locale('tr')],
      localizationsDelegates: messages,
      routerConfig: ref.watch(routerProvider),
    );
  }
}
