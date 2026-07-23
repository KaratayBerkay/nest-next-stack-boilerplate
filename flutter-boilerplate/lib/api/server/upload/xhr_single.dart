import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

final uploadServerProvider = Provider((ref) => UploadServer(ref.read(dioProvider)));

class UploadServer {
  final Dio _dio;

  UploadServer(this._dio);

  Future<String> call(String filePath) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath),
    });
    final response = await _dio.post<dynamic>(Urls.upload, data: formData);
    return response.data['url'] as String;
  }
}
