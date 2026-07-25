import 'dart:async';
import 'dart:math';

import 'package:dio/dio.dart';

import '../app_config.dart';
import '../constants/api/urls.dart';

final _random = Random();

String _generateSessionId() {
  final now = DateTime.now().millisecondsSinceEpoch;
  final rand = _random.nextDouble().toString().substring(2);
  return '$now-$rand';
}

class ActivityLogger {
  static ActivityLogger? _instance;

  late final String _sessionId;
  final List<Map<String, dynamic>> _batch = [];
  Timer? _flushTimer;
  Dio? _dio;

  ActivityLogger._() {
    _sessionId = _generateSessionId();
  }

  static ActivityLogger get instance {
    _instance ??= ActivityLogger._();
    return _instance!;
  }

  String get clientSessionId => _sessionId;

  void enqueue(Map<String, dynamic> event) {
    final fullEvent = <String, dynamic>{
      ...event,
      'eventType': event['eventType'] ?? event['event'],
      'clientSessionId': clientSessionId,
      'timestamp': DateTime.now().toUtc().toIso8601String(),
    };

    _batch.add(fullEvent);

    if (_batch.length >= 10) {
      _flushTimer?.cancel();
      _flushTimer = null;
      _flush();
    } else {
      _scheduleFlush();
    }
  }

  void _scheduleFlush() {
    if (_flushTimer != null) return;
    _flushTimer = Timer(const Duration(seconds: 5), () {
      _flushTimer = null;
      _flush();
    });
  }

  Future<void> _flush() async {
    if (_batch.isEmpty) return;
    final events = List<Map<String, dynamic>>.from(_batch);
    _batch.clear();
    try {
      final dio = _dio ?? Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl));
      await dio.post<dynamic>(
        Urls.activityLogs,
        data: {'events': events},
      );
    } catch (_) {
      // fire-and-forget: swallow errors silently
    }
  }

  Future<void> flushNow() async {
    _flushTimer?.cancel();
    _flushTimer = null;
    await _flush();
  }
}
