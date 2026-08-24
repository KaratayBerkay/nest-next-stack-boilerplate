import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final leaveStreamServerProvider =
    Provider((ref) => LeaveStreamServer(ref.read(dioProvider)));

class LeaveStreamServer {
  final Dio _dio;

  LeaveStreamServer(this._dio);

  Future<void> call(String slug) async {
    await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query':
            'mutation LeaveStreamAsViewer(\$slug: String!) { leaveStreamAsViewer(slug: \$slug) }',
        'variables': {'slug': slug},
      },
    );
  }
}
