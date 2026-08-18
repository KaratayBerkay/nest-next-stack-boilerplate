import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:web_socket_channel/io.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import '../crypto/session.dart';

enum RealtimeStatus { idle, connecting, authenticating, open, backoff, down }

typedef RealtimeFrameCallback = void Function(Map<String, dynamic> frame);

class RealtimeClient {
  final String url;
  final Future<Map<String, String>?> Function() getTokens;
  final void Function(RealtimeStatus) onStatusChange;
  final RealtimeFrameCallback onFrame;
  final VoidCallback? onAuthenticated;
  final Future<void> Function()? onBustTokenCache;
  // DM content is delivered wire-encrypted per-connection
  // (RealtimeGateway.emitToUserEncrypted) — without a completed handshake
  // every such frame is undecryptable and silently dropped. Both optional:
  // a null handshake callback degrades gracefully to plaintext-only, same
  // as web when the handshake itself fails (session.ts's
  // performHandshakeAfterAuth swallows the error and continues).
  final WireCryptoHandshakeCall? handshake;
  final WireCryptoReKeyCall? requestReKey;

  WebSocketChannel? _channel;
  RealtimeStatus _status = RealtimeStatus.idle;
  final List<Map<String, dynamic>> _sendQueue = [];
  final Set<String> _topicWatches = {};
  List<String> _registeredServices = [];
  final Map<String, ({String? page, Map<String, String>? params})> _claims = {};
  int _authFailRetries = 0;
  bool _pendingAuthFail = false;
  // Bumped on every connect() call; a callback captures the generation it
  // was scheduled under and no-ops if a newer attempt has since superseded
  // it. Without this, an uncancelled backoff timer racing a still-live
  // connection attempt caused a self-multiplying reconnect storm — see
  // _startBackoff.
  int _generation = 0;
  String? _lastSessionId;
  bool _rekeyInProgress = false;
  static const int _maxAuthFailRetries = 3;
  Timer? _reconnectTimer;
  Timer? _backoffTimer;
  bool _destroyed = false;
  bool _hasConnectedBefore = false;
  static const int _backoffBaseMs = 1000;
  static const int _backoffCapMs = 30000;

  static final _topicAllowlist =
      RegExp(r'^(feed|post:[a-z0-9]+|conversation:[a-z0-9]+)$');

  RealtimeClient({
    required this.url,
    required this.getTokens,
    required this.onStatusChange,
    required this.onFrame,
    this.onAuthenticated,
    this.onBustTokenCache,
    this.handshake,
    this.requestReKey,
  });

  RealtimeStatus get status => _status;

  void connect() {
    // `disconnect()` sets `_destroyed` so in-flight async callbacks from the
    // connection being torn down (an old `.ready`/`_handleOpen` future
    // completing late) no-op instead of acting on a dead channel. But
    // `connect()` is also the reconnection entry point after an explicit
    // `disconnect()` (e.g. logout then log back in) on this same
    // long-lived, non-autoDispose client instance — clear it here so a new
    // connection attempt isn't permanently blocked by the previous one.
    _destroyed = false;
    // Any timer scheduled by an attempt this call supersedes must not also
    // fire later — see _generation.
    _backoffTimer?.cancel();
    _reconnectTimer?.cancel();
    _setStatus(RealtimeStatus.connecting);
    final myGeneration = ++_generation;
    unawaited(_connectWithAuth(myGeneration));
  }

  // RealtimeGateway.verifyUpgrade authenticates the WS handshake itself,
  // the same way it validates any HTTP request: httpOnly session cookies,
  // never a client-sent post-open message (the gateway has no handler
  // registered for one). A browser attaches its cookie jar to the upgrade
  // request automatically; native `web_socket_channel` has no such jar, so
  // the cookie header has to be built and attached by hand before the
  // socket even opens. Names must match
  // RealtimeGateway.SESSION_COOKIE_NAMES exactly.
  Future<void> _connectWithAuth(int myGeneration) async {
    final tokens =
        _pendingAuthFail ? await _refreshAndFetchTokens() : await getTokens();
    _pendingAuthFail = false;

    // Superseded (a newer connect() already ran) or torn down while the
    // token fetch above was in flight — don't let a stale attempt open a
    // second competing socket.
    if (myGeneration != _generation || _destroyed) return;

    if (tokens == null) {
      debugPrint('[Realtime] no tokens available, not connecting');
      _handleDisconnect(myGeneration);
      return;
    }

    final wsUrl = Uri.parse(url);
    debugPrint('[Realtime] connecting to $wsUrl');
    final cookieHeader = [
      'access_token=${tokens['accessToken']}',
      'rbac_token=${tokens['rbacToken']}',
      'device_token=${tokens['deviceToken']}',
      'user_token=${tokens['userToken']}',
    ].join('; ');
    _channel = IOWebSocketChannel.connect(
      wsUrl,
      headers: {'Cookie': cookieHeader},
    );

    _channel!.stream.listen(
      (data) => handleMessage(data),
      onDone: () => _handleDisconnect(myGeneration),
      onError: (_) => _handleDisconnect(myGeneration),
    );

    _channel!.ready.then((_) => handleOpen()).catchError((Object e) {
      debugPrint('[Realtime] connect failed: $e');
      // A rejected handshake (e.g. an expired access-token cookie) surfaces
      // here as a generic connection failure, not a post-open message —
      // retry once with freshly refreshed tokens before falling back to
      // plain backoff.
      if (_authFailRetries == 0) _pendingAuthFail = true;
      _handleDisconnect(myGeneration);
    });
  }

  @visibleForTesting
  Future<void> handleOpen() async {
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
      debugPrint(
        '[Realtime] no tokens available, closing (destroyed=$_destroyed)',
      );
      _channel?.sink.close();
      return;
    }
    _send({'type': 'auth', 'tokens': tokens});
  }

  @visibleForTesting
  void handleMessage(dynamic raw) {
    if (_destroyed) return;
    try {
      final data = jsonDecode(raw as String) as Map<String, dynamic>;

      // DM content arrives wire-encrypted per-connection
      // (RealtimeGateway.emitToUserEncrypted) — control frames (register,
      // watch, page, authenticated, error, crypto-resync) never are. Mirrors
      // web's onmessage handler: an encrypted frame is decrypted and handed
      // straight to onFrame, bypassing the plain-control-frame checks below
      // entirely (they're mutually exclusive, not a fallback chain).
      final envelope = WireEnvelopeV2.tryParse(data);
      if (envelope != null) {
        if (!wireCryptoHasSession()) return;
        unawaited(_decryptAndDispatch(envelope));
        return;
      }

      if (data['type'] == 'error' &&
          (data['msg'] as String?)?.toLowerCase().contains('auth') == true) {
        debugPrint('[Realtime] auth failed: ${data['msg']}');
        _pendingAuthFail = true;
        _channel?.sink.close();
        return;
      }
      if (data['type'] == 'authenticated') {
        _authFailRetries = 0;
        _pendingAuthFail = false;
        unawaited(_completeAuthentication(data['sessionId'] as String?));
        return;
      }
      if (data['type'] == 'crypto-resync') {
        unawaited(_resyncWireCrypto());
        return;
      }
      onFrame(data);
    } catch (_) {}
  }

  Future<void> _decryptAndDispatch(WireEnvelopeV2 envelope) async {
    try {
      final frame = await decryptFromServer(envelope);
      if (frame is Map<String, dynamic>) {
        onFrame(frame);
      }
    } catch (e) {
      debugPrint('[Realtime] wire-decrypt failed: $e');
      // Stale keys or a server flush — flush and re-handshake with a fresh
      // keypair (matches web's onmessage catch block calling reKey()).
      unawaited(_reKeyAfterDecryptFailure());
    }
  }

  // Server detected a c2s decrypt failure (seq desync). Resync via a fresh
  // handshake — this adopts the server's counters WITHOUT flushing keys,
  // unlike an s2c failure's full re-key above.
  Future<void> _resyncWireCrypto() async {
    if (_rekeyInProgress || _lastSessionId == null || handshake == null) {
      return;
    }
    _rekeyInProgress = true;
    try {
      final deviceToken = (await getTokens())?['deviceToken'];
      if (deviceToken != null) {
        await performWireCryptoHandshake(
          deviceToken: deviceToken,
          handshake: handshake!,
        );
      }
    } catch (_) {
      // Best-effort.
    } finally {
      _rekeyInProgress = false;
    }
  }

  Future<void> _reKeyAfterDecryptFailure() async {
    if (_rekeyInProgress || requestReKey == null || handshake == null) return;
    _rekeyInProgress = true;
    try {
      final deviceToken = (await getTokens())?['deviceToken'];
      if (deviceToken != null) {
        await reKeyWireCrypto(
          deviceToken: deviceToken,
          handshake: handshake!,
          requestReKey: requestReKey!,
        );
      }
    } catch (_) {
      // Best-effort.
    } finally {
      _rekeyInProgress = false;
    }
  }

  // Mirrors web's performHandshakeAfterAuth: best-effort handshake before
  // flipping to `open` — a failed/skipped handshake degrades to
  // plaintext-only delivery rather than blocking the connection.
  Future<void> _completeAuthentication(String? sessionId) async {
    if (_destroyed) return;
    if (sessionId != null && handshake != null) {
      _lastSessionId = sessionId;
      try {
        final deviceToken = (await getTokens())?['deviceToken'];
        if (deviceToken != null) {
          await performWireCryptoHandshake(
            deviceToken: deviceToken,
            handshake: handshake!,
          );
        }
      } catch (_) {
        // Best-effort — continue without wire-crypto.
      }
    }
    if (_destroyed) return;
    _setStatus(RealtimeStatus.open);
    _flushQueue();
    _replaySubscriptions();
    _replayClaims();
    onAuthenticated?.call();
  }

  void disconnect() {
    _destroyed = true;
    _reconnectTimer?.cancel();
    _backoffTimer?.cancel();
    _channel?.sink.close();
    _channel = null;
    _sendQueue.clear();
    wireCryptoDestroySession();
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
    debugPrint('[Realtime] status -> $s');
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
    await onBustTokenCache?.call();
    return getTokens();
  }

  void _handleDisconnect(int generation) {
    // A stale generation here means a newer connect() already superseded
    // this attempt (and owns whatever's now in _channel) — nulling it out
    // or scheduling a second competing retry on top of that one is exactly
    // the double-timer bug this guards against.
    if (_destroyed || generation != _generation) return;
    _channel = null;
    // A dropped connection's wire-crypto session dies with it — the
    // reconnect gets a fresh 'authenticated' frame and re-handshakes.
    // Mirrors web's ws.onclose calling destroySession().
    wireCryptoDestroySession();
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
      _backoffBaseMs *
          pow(2, _authFailRetries - 1) *
          (0.5 + Random().nextDouble() * 0.5),
      _backoffCapMs,
    ).toInt();
    _setStatus(RealtimeStatus.backoff);
    _backoffTimer?.cancel();
    _backoffTimer = Timer(Duration(milliseconds: delay), () => connect());
  }

  void _scheduleDegradedRetry() {
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(const Duration(seconds: 60), () {
      if (_destroyed) return;
      _authFailRetries = 0;
      connect();
    });
  }
}
