import 'dart:collection';
import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

class NetworkCache {
  NetworkCache._();

  static final _memoryCache = HashMap<String, _CacheEntry>();
  static const _defaultMaxAge = Duration(minutes: 5);
  static const _prefsKey = 'network_cache';

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final json = prefs.getString(_prefsKey);
    if (json == null) return;
    try {
      final decoded = jsonDecode(json) as Map<String, dynamic>;
      for (final entry in decoded.entries) {
        _memoryCache[entry.key] =
            _CacheEntry.fromJson(entry.value as Map<String, dynamic>);
      }
    } catch (_) {}
  }

  static String? get(String key, {Duration? maxAge}) {
    final entry = _memoryCache[key];
    if (entry == null) return null;
    final age = DateTime.now().difference(entry.timestamp);
    if (age > (maxAge ?? _defaultMaxAge)) {
      _memoryCache.remove(key);
      return null;
    }
    return entry.data;
  }

  static Future<void> set(String key, String data) async {
    _memoryCache[key] = _CacheEntry(data: data, timestamp: DateTime.now());
    await _persist();
  }

  static Future<void> invalidate(String key) async {
    _memoryCache.remove(key);
    await _persist();
  }

  static Future<void> invalidateAll() async {
    _memoryCache.clear();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_prefsKey);
  }

  static Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    final json =
        jsonEncode(_memoryCache.map((k, v) => MapEntry(k, v.toJson())));
    await prefs.setString(_prefsKey, json);
  }
}

class _CacheEntry {
  final String data;
  final DateTime timestamp;

  const _CacheEntry({required this.data, required this.timestamp});

  Map<String, dynamic> toJson() => {
        'data': data,
        'timestamp': timestamp.toIso8601String(),
      };

  factory _CacheEntry.fromJson(Map<String, dynamic> json) => _CacheEntry(
        data: json['data'] as String,
        timestamp: DateTime.parse(json['timestamp'] as String),
      );
}
