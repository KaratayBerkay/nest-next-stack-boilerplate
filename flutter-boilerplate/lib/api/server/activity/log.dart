import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final activityLogServerProvider =
    Provider((ref) => ActivityLogServer(ref.read(dioProvider)));

class ActivityLogServer {
  final Dio _dio;

  ActivityLogServer(this._dio);

  Future<void> call(List<Map<String, dynamic>> events) async {
    await _dio.post<dynamic>(
      '/api/activity-logs',
      data: {'events': events},
    );
  }
}
