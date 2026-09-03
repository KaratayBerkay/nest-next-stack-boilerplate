import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Secure-storage key holding this device's X25519 wire-crypto keypair and
/// sequence counters (see `session.dart`), scoped by the device token the
/// server keys its half of the exchange on.
String wireCryptoStorageKey(String deviceToken) =>
    'wire_crypto_keys_$deviceToken';

/// Deletes the keypair kept for [deviceToken]. Used by the re-key path and
/// by logout — the token is dropped there, so a keypair scoped to it would
/// otherwise stay behind in Keystore/Keychain-backed storage forever, one
/// orphaned private key per login/logout cycle (MOB-045).
Future<void> deleteWireCryptoKeys(
  String deviceToken, {
  FlutterSecureStorage storage = const FlutterSecureStorage(),
}) {
  return storage.delete(key: wireCryptoStorageKey(deviceToken));
}
