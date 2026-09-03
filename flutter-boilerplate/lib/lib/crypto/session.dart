// Per-device wire encryption (trusted-server model), mirroring
// next-js-boilerplate's `lib/crypto/session.ts` byte-for-byte — the AAD
// format, HKDF info string, and key derivation below must match
// `WireCryptoService` on the server exactly or every frame silently fails
// to decrypt.
//
// On first handshake this generates an X25519 keypair, persists it in
// secure storage, and exchanges public keys with the server. The shared
// secret is derived via ECDH + HKDF. On a later reconnect the stored
// keypair is reused — no new keypair is generated unless the server has no
// matching keys (e.g. after a re-key).

import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:cryptography/cryptography.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../api/server/crypto/handshake.dart';
import 'wire_crypto_storage.dart';

const _wireCryptoContext = 'session-crypto-v1';
const _macLength = 16; // Poly1305 tag, appended to ct on the wire.

final _cipher = Xchacha20.poly1305Aead();
const _storage = FlutterSecureStorage();

typedef WireCryptoHandshakeCall = Future<CryptoHandshakeResult> Function(
  String publicKeyHex,
);
typedef WireCryptoReKeyCall = Future<void> Function();

class WireEnvelopeV2 {
  final String nonce; // base64
  final String ct; // base64

  const WireEnvelopeV2({required this.nonce, required this.ct});

  static WireEnvelopeV2? tryParse(Map<String, dynamic> json) {
    if (json['v'] != 2) return null;
    final nonce = json['nonce'];
    final ct = json['ct'];
    if (nonce is! String || ct is! String) return null;
    return WireEnvelopeV2(nonce: nonce, ct: ct);
  }
}

class _StoredKeys {
  final String privHex;
  final String pubHex;
  final int sendSeq;
  final int recvSeq;

  const _StoredKeys({
    required this.privHex,
    required this.pubHex,
    required this.sendSeq,
    required this.recvSeq,
  });

  Map<String, dynamic> toJson() => {
        'priv': privHex,
        'pub': pubHex,
        'sendSeq': sendSeq,
        'recvSeq': recvSeq,
      };

  static _StoredKeys? fromJson(Map<String, dynamic> json) {
    final priv = json['priv'];
    final pub = json['pub'];
    if (priv is! String || pub is! String) return null;
    return _StoredKeys(
      privHex: priv,
      pubHex: pub,
      sendSeq: json['sendSeq'] as int? ?? 0,
      recvSeq: json['recvSeq'] as int? ?? 0,
    );
  }
}

class _SessionState {
  final String deviceToken;
  final String deviceHash;
  final SecretKey sharedKey;
  int sendSeq;
  int recvSeq;

  _SessionState({
    required this.deviceToken,
    required this.deviceHash,
    required this.sharedKey,
    required this.sendSeq,
    required this.recvSeq,
  });
}

// ── Module-level state (one per app session, mirrors "one per browser tab") ─

_SessionState? _state;
Timer? _persistTimer;

/// Whether a wire-crypto session has been established.
bool wireCryptoHasSession() => _state != null;

/// Tear down the in-memory session (call on disconnect/logout). Persisted
/// keys are untouched — the next handshake reuses them.
void wireCryptoDestroySession() {
  _state = null;
}

// ── Handshake ────────────────────────────────────────────────────────────

/// Perform the wire-crypto handshake. Call this once after the WS
/// connection is authenticated (mirrors web's `performHandshake`, called
/// from `performHandshakeAfterAuth`).
Future<void> performWireCryptoHandshake({
  required String deviceToken,
  required WireCryptoHandshakeCall handshake,
}) async {
  final deviceHash = _bytesToHex(
    (await Sha256().hash(utf8.encode(deviceToken))).bytes,
  );

  final stored = await _loadKeys(deviceToken);
  final SimpleKeyPair keyPair;
  if (stored != null) {
    keyPair = SimpleKeyPairData(
      _hexToBytes(stored.privHex),
      publicKey: SimplePublicKey(
        _hexToBytes(stored.pubHex),
        type: KeyPairType.x25519,
      ),
      type: KeyPairType.x25519,
    );
  } else {
    keyPair = await X25519().newKeyPair();
    final pub = await keyPair.extractPublicKey();
    final priv = await keyPair.extractPrivateKeyBytes();
    // Store immediately (seq-only persist below re-reads this to merge in
    // updated counters without holding the private key in memory longer
    // than necessary).
    await _storeKeys(
      deviceToken,
      _StoredKeys(
        privHex: _bytesToHex(priv),
        pubHex: _bytesToHex(pub.bytes),
        sendSeq: 0,
        recvSeq: 0,
      ),
    );
  }

  final clientPub = await keyPair.extractPublicKey();
  final result = await handshake(_bytesToHex(clientPub.bytes));

  final shared = await X25519().sharedSecretKey(
    keyPair: keyPair,
    remotePublicKey: SimplePublicKey(
      _hexToBytes(result.serverPublicKey),
      type: KeyPairType.x25519,
    ),
  );
  // No salt (nonce), matching session.ts's `hkdf(sha256, shared, new
  // Uint8Array(0), info, 32)` — the empty salt is the package default too.
  final derived = await Hkdf(hmac: Hmac.sha256(), outputLength: 32).deriveKey(
    secretKey: SecretKey(await shared.extractBytes()),
    info: utf8.encode('$_wireCryptoContext:$deviceHash'),
  );

  // Adopt the server's counters exactly — see the equivalent comment in
  // session.ts: walking forward or back is always safe, the server's seqs
  // are authoritative.
  _state = _SessionState(
    deviceToken: deviceToken,
    deviceHash: deviceHash,
    sharedKey: derived,
    sendSeq: result.c2sSeq ?? stored?.sendSeq ?? 0,
    recvSeq: result.s2cSeq ?? stored?.recvSeq ?? 0,
  );

  _schedulePersistSeq();
}

/// Re-key: flush stored keys and re-handshake with a fresh keypair. Call
/// this when decryption fails (stale keys / server flush).
Future<void> reKeyWireCrypto({
  required String deviceToken,
  required WireCryptoHandshakeCall handshake,
  required WireCryptoReKeyCall requestReKey,
}) async {
  await _flushKeys(deviceToken);
  try {
    await requestReKey();
  } catch (_) {
    // Best effort — server might already have flushed.
  }
  wireCryptoDestroySession();
  await performWireCryptoHandshake(
    deviceToken: deviceToken,
    handshake: handshake,
  );
}

// ── Encrypt (client → server) ────────────────────────────────────────────

/// Encrypt a payload for the server. Returns a wire-format map (`{v, nonce,
/// ct}`) ready to send as the WS frame body.
Future<Map<String, dynamic>> encryptForServer(dynamic payload) async {
  final state = _state;
  if (state == null) {
    throw StateError(
      'No wire-crypto session — call performWireCryptoHandshake first',
    );
  }
  final seq = ++state.sendSeq;
  final aad = _buildAad(state.deviceHash, 'c2s', seq);
  final secretBox = await _cipher.encrypt(
    utf8.encode(jsonEncode(payload)),
    secretKey: state.sharedKey,
    aad: utf8.encode(aad),
  );
  _schedulePersistSeq();
  return {
    'v': 2,
    'nonce': base64Encode(Uint8List.fromList(secretBox.nonce)),
    'ct': base64Encode(
      Uint8List.fromList([...secretBox.cipherText, ...secretBox.mac.bytes]),
    ),
  };
}

// ── Decrypt (server → client) ────────────────────────────────────────────

/// Decrypt a [WireEnvelopeV2] received from the server. Returns the parsed
/// JSON payload (throws if there's no session or the frame fails to
/// decrypt — stale keys, a server flush, or a genuinely tampered frame).
Future<dynamic> decryptFromServer(WireEnvelopeV2 envelope) async {
  final state = _state;
  if (state == null) {
    throw StateError(
      'No wire-crypto session — call performWireCryptoHandshake first',
    );
  }
  final seq = ++state.recvSeq;
  final aad = _buildAad(state.deviceHash, 's2c', seq);
  final nonce = base64Decode(envelope.nonce);
  final ctBytes = base64Decode(envelope.ct);
  final cipherText = ctBytes.sublist(0, ctBytes.length - _macLength);
  final mac = Mac(ctBytes.sublist(ctBytes.length - _macLength));

  final plainBytes = await _cipher.decrypt(
    SecretBox(cipherText, nonce: nonce, mac: mac),
    secretKey: state.sharedKey,
    aad: utf8.encode(aad),
  );
  _schedulePersistSeq();
  return jsonDecode(utf8.decode(plainBytes));
}

// ── AAD construction ─────────────────────────────────────────────────────

/// `session-crypto-v1|<deviceHash>|<direction>|<seq>` — must match
/// `WireCryptoService.buildAad()` on the server exactly.
String _buildAad(String context, String direction, int seq) {
  return '$_wireCryptoContext|$context|$direction|$seq';
}

// ── Seq persistence (throttled so rapid-fire frames don't hammer storage) ──

void _schedulePersistSeq() {
  final state = _state;
  if (state == null) return;
  final deviceToken = state.deviceToken;
  _persistTimer?.cancel();
  _persistTimer = Timer(const Duration(milliseconds: 500), () {
    unawaited(_persistSeqNow(deviceToken));
  });
}

Future<void> _persistSeqNow(String deviceToken) async {
  final current = _state;
  if (current == null || current.deviceToken != deviceToken) return;
  final sendSeq = current.sendSeq;
  final recvSeq = current.recvSeq;
  // Read the private/public key back rather than keeping them on
  // _SessionState — mirrors session.ts's persistSeq, which does the same to
  // avoid holding the private key in memory longer than the handshake needs.
  final existing = await _loadKeys(deviceToken);
  if (existing == null) return;
  await _storeKeys(
    deviceToken,
    _StoredKeys(
      privHex: existing.privHex,
      pubHex: existing.pubHex,
      sendSeq: sendSeq,
      recvSeq: recvSeq,
    ),
  );
}

// ── Storage ──────────────────────────────────────────────────────────────

Future<_StoredKeys?> _loadKeys(String deviceToken) async {
  final raw = await _storage.read(key: wireCryptoStorageKey(deviceToken));
  if (raw == null) return null;
  try {
    return _StoredKeys.fromJson(jsonDecode(raw) as Map<String, dynamic>);
  } catch (_) {
    return null;
  }
}

Future<void> _storeKeys(String deviceToken, _StoredKeys keys) async {
  await _storage.write(
    key: wireCryptoStorageKey(deviceToken),
    value: jsonEncode(keys.toJson()),
  );
}

Future<void> _flushKeys(String deviceToken) =>
    deleteWireCryptoKeys(deviceToken);

// ── Hex helpers (dart:convert has base64 but not hex) ───────────────────

String _bytesToHex(List<int> bytes) {
  final buffer = StringBuffer();
  for (final b in bytes) {
    buffer.write(b.toRadixString(16).padLeft(2, '0'));
  }
  return buffer.toString();
}

Uint8List _hexToBytes(String hex) {
  final bytes = Uint8List(hex.length ~/ 2);
  for (var i = 0; i < bytes.length; i++) {
    bytes[i] = int.parse(hex.substring(i * 2, i * 2 + 2), radix: 16);
  }
  return bytes;
}
