import 'package:flutter/material.dart';

import 'activity_logger.dart';

class ActivityRouteObserver extends NavigatorObserver {
  String? _currentRouteName;
  int? _entryTimestamp;

  String? _routeName(Route<dynamic> route) {
    return route.settings.name;
  }

  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPush(route, previousRoute);

    final prevName = _currentRouteName;
    final prevTs = _entryTimestamp;
    final newName = _routeName(route);

    if (prevName != null && prevTs != null) {
      final durationMs = DateTime.now().millisecondsSinceEpoch - prevTs;
      ActivityLogger.instance.enqueue({
        'category': 'page',
        'event': 'page.exit',
        'page': prevName,
        'durationMs': durationMs,
      });
    }

    _currentRouteName = newName;
    _entryTimestamp = DateTime.now().millisecondsSinceEpoch;

    if (newName != null) {
      ActivityLogger.instance.enqueue({
        'category': 'page',
        'event': 'page.view',
        'page': newName,
      });
    }
  }

  @override
  void didReplace({Route<dynamic>? newRoute, Route<dynamic>? oldRoute}) {
    super.didReplace(newRoute: newRoute, oldRoute: oldRoute);

    final prevName = _currentRouteName;
    final prevTs = _entryTimestamp;
    final newName = _routeName(newRoute!);

    if (prevName != null && prevTs != null) {
      final durationMs = DateTime.now().millisecondsSinceEpoch - prevTs;
      ActivityLogger.instance.enqueue({
        'category': 'page',
        'event': 'page.exit',
        'page': prevName,
        'durationMs': durationMs,
      });
    }

    _currentRouteName = newName;
    _entryTimestamp = DateTime.now().millisecondsSinceEpoch;

    if (newName != null) {
      ActivityLogger.instance.enqueue({
        'category': 'page',
        'event': 'page.view',
        'page': newName,
      });
    }
  }

  @override
  void didPop(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPop(route, previousRoute);

    final prevName = _currentRouteName;
    final prevTs = _entryTimestamp;
    final newName = previousRoute != null ? _routeName(previousRoute) : null;

    if (prevName != null && prevTs != null) {
      final durationMs = DateTime.now().millisecondsSinceEpoch - prevTs;
      ActivityLogger.instance.enqueue({
        'category': 'page',
        'event': 'page.exit',
        'page': prevName,
        'durationMs': durationMs,
      });
    }

    _currentRouteName = newName;
    _entryTimestamp = DateTime.now().millisecondsSinceEpoch;

    if (newName != null) {
      ActivityLogger.instance.enqueue({
        'category': 'page',
        'event': 'page.view',
        'page': newName,
      });
    }
  }
}
