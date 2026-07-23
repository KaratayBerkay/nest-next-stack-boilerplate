import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

final markReadServerProvider = Provider((ref) => MarkReadServer(ref.read(dioProvider)));

class MarkReadServer {
  final Dio _dio;

  MarkReadServer(this._dio);

  Future<void> call(String conversationId) async {
    await _dio.post<dynamic>('${Urls.messagesRead}/$conversationId');
  }
}
