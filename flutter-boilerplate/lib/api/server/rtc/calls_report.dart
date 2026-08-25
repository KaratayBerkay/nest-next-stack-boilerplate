import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final reportCallServerProvider =
    Provider((ref) => ReportCallServer(ref.read(dioProvider)));

class ReportCallServer {
  final Dio _dio;

  ReportCallServer(this._dio);

  Future<void> call(String callId, String reason, {String? details}) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query':
            'mutation ReportCall(\$callId: String!, \$reason: RtcReportReason!, \$details: String) { reportCall(callId: \$callId, reason: \$reason, details: \$details) { id } }',
        'variables': {'callId': callId, 'reason': reason, 'details': details},
      },
    );
    final body = response.data as Map<String, dynamic>;
    if (body['errors'] != null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Failed to submit report',
      );
    }
  }
}
