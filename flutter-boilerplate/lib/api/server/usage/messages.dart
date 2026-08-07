import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class MessageUsageResult {
  final int letters;
  final int bytes;
  final int limitBytes;
  final String tier;
  final int multiplier;
  final String from;
  final String to;

  const MessageUsageResult({
    required this.letters,
    required this.bytes,
    required this.limitBytes,
    required this.tier,
    required this.multiplier,
    required this.from,
    required this.to,
  });

  factory MessageUsageResult.fromJson(Map<String, dynamic> json) {
    return MessageUsageResult(
      letters: json['letters'] as int,
      bytes: json['bytes'] as int,
      limitBytes: json['limitBytes'] as int,
      tier: json['tier'] as String,
      multiplier: json['multiplier'] as int,
      from: json['from'] as String,
      to: json['to'] as String,
    );
  }
}

final messageUsageServerProvider = Provider(
  (ref) => MessageUsageServer(ref.read(dioProvider)),
);

class MessageUsageServer {
  final Dio _dio;

  MessageUsageServer(this._dio);

  Future<MessageUsageResult> call({String? from, String? to}) async {
    final response = await _dio.get<dynamic>(
      '/api/usage/messages',
      queryParameters: {
        if (from != null) 'from': from,
        if (to != null) 'to': to,
      },
    );
    return MessageUsageResult.fromJson(response.data as Map<String, dynamic>);
  }
}
