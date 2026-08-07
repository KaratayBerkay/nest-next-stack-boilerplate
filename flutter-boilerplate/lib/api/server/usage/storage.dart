import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class UploadStorageUsageResult {
  final int bytes;
  final int fileCount;
  final int limitBytes;
  final String tier;
  final int multiplier;

  const UploadStorageUsageResult({
    required this.bytes,
    required this.fileCount,
    required this.limitBytes,
    required this.tier,
    required this.multiplier,
  });

  factory UploadStorageUsageResult.fromJson(Map<String, dynamic> json) {
    return UploadStorageUsageResult(
      bytes: json['bytes'] as int,
      fileCount: json['fileCount'] as int,
      limitBytes: json['limitBytes'] as int,
      tier: json['tier'] as String,
      multiplier: json['multiplier'] as int,
    );
  }
}

final storageUsageServerProvider = Provider(
  (ref) => StorageUsageServer(ref.read(dioProvider)),
);

class StorageUsageServer {
  final Dio _dio;

  StorageUsageServer(this._dio);

  Future<UploadStorageUsageResult> call() async {
    final response = await _dio.get<dynamic>('/api/usage/storage');
    return UploadStorageUsageResult.fromJson(
      response.data as Map<String, dynamic>,
    );
  }
}
