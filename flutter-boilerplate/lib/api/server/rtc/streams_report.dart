import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final reportStreamServerProvider =
    Provider((ref) => ReportStreamServer(ref.read(dioProvider)));

class ReportStreamServer {
  final Dio _dio;

  ReportStreamServer(this._dio);

  Future<void> call(
    String slug,
    String reason, {
    String? details,
    String? reportedUserId,
  }) async {
    final response = await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query':
            'mutation ReportStream(\$slug: String!, \$reason: RtcReportReason!, \$details: String, \$reportedUserId: String) { reportStream(slug: \$slug, reason: \$reason, details: \$details, reportedUserId: \$reportedUserId) { id } }',
        'variables': {
          'slug': slug,
          'reason': reason,
          'details': details,
          'reportedUserId': reportedUserId,
        },
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
