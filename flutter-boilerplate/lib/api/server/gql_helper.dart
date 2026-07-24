import 'package:dio/dio.dart';

class GqlError extends DioException {
  final String gqlMessage;
  GqlError({required this.gqlMessage, required super.requestOptions})
      : super(message: gqlMessage);
}

Future<Map<String, dynamic>> gqlQuery(
  Dio dio,
  String query,
  Map<String, dynamic> variables,
) async {
  final response = await dio.post<dynamic>(
    '/graphql',
    data: {'query': query, 'variables': variables},
  );
  final body = response.data as Map<String, dynamic>;
  if (body['errors'] != null) {
    final msgs = (body['errors'] as List)
        .map((e) => (e as Map<String, dynamic>)['message'] as String?)
        .where((m) => m != null)
        .join(', ');
    throw GqlError(
      gqlMessage: msgs.isNotEmpty ? msgs : 'GraphQL error',
      requestOptions: response.requestOptions,
    );
  }
  return (body['data'] as Map<String, dynamic>)[_operationName(query)]
      as Map<String, dynamic>;
}

String _operationName(String query) {
  final match = RegExp(r'(?:query|mutation)\s+(\w+)').firstMatch(query);
  return match?.group(1) ?? '';
}
