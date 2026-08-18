import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/constants/api/urls.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final cryptoReKeyServerProvider = Provider(
  (ref) => CryptoReKeyServer(ref.read(dioProvider)),
);

class CryptoReKeyServer {
  final Dio _dio;

  CryptoReKeyServer(this._dio);

  Future<void> call() async {
    await _dio.post<dynamic>(Urls.cryptoReKey);
  }
}
