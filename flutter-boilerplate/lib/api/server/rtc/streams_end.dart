import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final endStreamServerProvider =
    Provider((ref) => EndStreamServer(ref.read(dioProvider)));

class EndStreamServer {
  final Dio _dio;

  EndStreamServer(this._dio);

  Future<void> call(String slug) async {
    await _dio.post<dynamic>(
      '/graphql',
      data: {
        'query':
            'mutation EndStream(\$slug: String!) { endStream(slug: \$slug) }',
        'variables': {'slug': slug},
      },
    );
  }
}
