import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_web_plugins/url_strategy.dart';
import 'package:timezone/data/latest_10y.dart' as tzdata;

import 'app/app.dart';
import 'lib/activity_logger.dart';

Future<void> main() async {
  usePathUrlStrategy();
  WidgetsFlutterBinding.ensureInitialized();
  // CROSS-019: tz database for rendering dates in the profile's timezone
  // (DateTimeHelper.setPreferredTimeZone). ~10 years of rules is plenty.
  tzdata.initializeTimeZones();

  final originalFlutterError = FlutterError.onError;
  FlutterError.onError = (FlutterErrorDetails details) {
    ActivityLogger.instance.enqueue({
      'category': 'application-exception',
      'event': 'application-exception.framework_error',
      'exceptionType': 'CLIENT_ERROR',
      'metadata': {
        'exception': details.exceptionAsString(),
        'stack': details.stack?.toString(),
        'context': details.context?.toString(),
      },
    });
    originalFlutterError?.call(details);
  };

  final originalPlatformError = ui.PlatformDispatcher.instance.onError;
  ui.PlatformDispatcher.instance.onError = (Object error, StackTrace stack) {
    ActivityLogger.instance.enqueue({
      'category': 'application-exception',
      'event': 'application-exception.unhandled_error',
      'exceptionType': 'CLIENT_REJECTION',
      'metadata': {
        'exception': error.toString(),
        'stack': stack.toString(),
      },
    });
    return originalPlatformError?.call(error, stack) ?? false;
  };

  runApp(
    const ProviderScope(
      child: FlutterBoilerplateApp(),
    ),
  );
}
