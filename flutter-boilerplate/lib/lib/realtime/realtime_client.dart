import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

enum RealtimeStatus { idle, connecting, authenticating, open, backoff, down }

typedef RealtimeFrameCallback = void Function(Map<String, dynamic> frame);

class RealtimeClient {
  final String url;
  final Future<Map<String, String>?> Function() getTokens;
  final void Function(RealtimeStatus) onStatusChange;
  final RealtimeFrameCallback onFrame;
  final VoidCallback? onAuthenticated;
  final VoidCallback? onBustTokenCache;

  WebSocketChannel? _channel;
  RealtimeStatus _status = RealtimeStatus.idle;
  final List<Map<String, dynamic>> _sendQueue = [];
  final Set<String> _topicWatches = {};
  List<String> _registeredServices = [];
  final Map<String, ({String? page, Map<String, String>? params})> _claims = {};
  int _authFailRetries = 0;
  bool _pendingAuthFail = false;
  static const int _maxAuthFailRetries = 3;
  Timer? _reconnectTimer;
  Timer? _backoffTimer;
  bool _destroyed = false;
  bool _hasConnectedBefore = false;
  static const int _backoffBaseMs = 1000;
  static const int _backoffCapMs = 30000;

  static final _topicAllowlist = RegExp(r'^(feed|post:[a-z0-9]+|conversation:[a-z0-9]+)$');

  RealtimeClient({
    required this.url,
    required this.getTokens,
    required this.onStatusChange,
    required this.onFrame,
    this.onAuthenticated,
    this.onBustTokenCache,
  });

  RealtimeStatus get status => _status;

  void connect() {
    if (_destroyed) return;
    _setStatus(RealtimeStatus.connecting);

    final wsUrl = Uri.parse(url);
    _channel = WebSocketChannel.connect(wsUrl);

    _channel!.stream.listen(
      (data) => _handleMessage(data),
      onDone: () => _handleDisconnect(),
      onError: (_) => _handleDisconnect(),
    );

    _channel!.ready.then((_) => _handleOpen());
  }

  Future<void> _handleOpen() async {
    if (_destroyed) return;
    _setStatus(RealtimeStatus.authenticating);

    Map<String, String>? tokens;
    if (_pendingAuthFail) {
      _pendingAuthFail = false;
      tokens = await _refreshAndFetchTokens();
    } else {
      tokens = await getTokens();
    }

    if (tokens == null || _destroyed) {
      _channel?.sink.close();
      return;
    }
    _send({'type': 'auth', 'tokens': tokens});
  }

  void _handleMessage(dynamic raw) {
    if (_destroyed) return;
    try {
      final data = jsonDecode(raw as String) as Map<String, dynamic>;
      if (data['type'] == 'error' &&
          (data['message'] as String?)?.toLowerCase().contains('auth') == true) {
        _pendingAuthFail = true;
        _channel?.sink.close();
        return;
      }
      if (data['type'] == 'authenticated') {
        _authFailRetries = 0;
        _pendingAuthFail = false;
        _setStatus(RealtimeStatus.open);
        _flushQueue();
        _replaySubscriptions();
        _replayClaims();
        onAuthenticated?.call();
        return;
      }
      onFrame(data);
    } catch (_) {}
  }

  void disconnect() {
    _destroyed = true;
    _reconnectTimer?.cancel();
    _backoffTimer?.cancel();
    _channel?.sink.close();
    _channel = null;
    _sendQueue.clear();
    _setStatus(RealtimeStatus.idle);
  }

  void send(Map<String, dynamic> data) {
    if (_status == RealtimeStatus.open && _channel != null) {
      _send(data);
    } else {
      _sendQueue.add(data);
    }
  }

  void watch(String topic) {
    if (!_topicAllowlist.hasMatch(topic)) return;
    _topicWatches.add(topic);
    send({'type': 'watch', 'topic': topic});
  }

  void unwatch(String topic) {
    _topicWatches.remove(topic);
    send({'type': 'unwatch', 'topic': topic});
  }

  void registerServices(List<String> services) {
    _registeredServices = services;
    send({'type': 'register', 'services': services});
  }

  void claimPage(String? page, {Map<String, String>? params, String? tabId}) {
    final id = tabId ?? '_default';
    _claims[id] = (page: page, params: params);
    send({'type': 'page', 'page': page, 'params': params, 'tabId': id});
  }

  void unclaimPage(String tabId) {
    _claims.remove(tabId);
    send({'type': 'page', 'page': null, 'tabId': tabId});
  }

  void _send(Map<String, dynamic> data) {
    _channel?.sink.add(jsonEncode(data));
  }

  void _setStatus(RealtimeStatus s) {
    _status = s;
    onStatusChange(s);
  }

  void _flushQueue() {
    if (_sendQueue.isEmpty || _channel == null) return;
    for (final msg in _sendQueue) {
      _send(msg);
    }
    _sendQueue.clear();
  }

  void _replaySubscriptions() {
    if (_hasConnectedBefore && _registeredServices.isNotEmpty) {
      _send({'type': 'register', 'services': _registeredServices});
    }
    _hasConnectedBefore = true;
    for (final topic in _topicWatches) {
      _send({'type': 'watch', 'topic': topic});
    }
  }

  void _replayClaims() {
    for (final entry in _claims.entries) {
      final tabId = entry.key;
      final claim = entry.value;
      _send({
        'type': 'page',
        'page': claim.page,
        'params': claim.params,
        'tabId': tabId,
      });
    }
  }

  Future<Map<String, String>?> _refreshAndFetchTokens() async {
    onBustTokenCache?.call();
    return getTokens();
  }

  void _handleDisconnect() {
    if (_destroyed) return;
    _channel = null;
    if (_authFailRetries < _maxAuthFailRetries) {
      _authFailRetries++;
      _startBackoff();
    } else {
      _setStatus(RealtimeStatus.down);
      _scheduleDegradedRetry();
    }
  }

  void _startBackoff() {
    final delay = min(
      _backoffBaseMs * pow(2, _authFailRetries - 1) * (0.5 + Random().nextDouble() * 0.5),
      _backoffCapMs,
    ).toInt();
    _setStatus(RealtimeStatus.backoff);
    _backoffTimer = Timer(Duration(milliseconds: delay), () => connect());
  }

  void _scheduleDegradedRetry() {
    _reconnectTimer = Timer(const Duration(seconds: 60), () {
      if (_destroyed) return;
      _authFailRetries = 0;
      connect();
    });
  }
}
