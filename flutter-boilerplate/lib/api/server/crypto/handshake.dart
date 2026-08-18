import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/constants/api/urls.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final cryptoHandshakeServerProvider = Provider(
  (ref) => CryptoHandshakeServer(ref.read(dioProvider)),
);

class CryptoHandshakeResult {
  final String serverPublicKey;
  final int? c2sSeq;
  final int? s2cSeq;

  const CryptoHandshakeResult({
    required this.serverPublicKey,
    this.c2sSeq,
    this.s2cSeq,
  });

  factory CryptoHandshakeResult.fromJson(Map<String, dynamic> json) {
    return CryptoHandshakeResult(
      serverPublicKey: json['serverPublicKey'] as String,
      c2sSeq: json['c2sSeq'] as int?,
      s2cSeq: json['s2cSeq'] as int?,
    );
  }
}

class CryptoHandshakeServer {
  final Dio _dio;

  CryptoHandshakeServer(this._dio);

  // x-device-token is attached automatically by AuthInterceptor (dioProvider)
  // for every request — the same device token WireCryptoService keys the
  // server-side device keypair to (WireCryptoController.handshake).
  Future<CryptoHandshakeResult> call(String publicKeyHex) async {
    final response = await _dio.post<dynamic>(
      Urls.cryptoHandshake,
      data: {'publicKey': publicKeyHex},
    );
    return CryptoHandshakeResult.fromJson(
      response.data as Map<String, dynamic>,
    );
  }
}
