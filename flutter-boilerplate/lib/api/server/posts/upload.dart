import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final postUploadServerProvider =
    Provider((ref) => PostUploadServer(ref.read(dioProvider)));

class PostUploadServer {
  final Dio _dio;

  PostUploadServer(this._dio);

  Future<String> call(String filePath) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath),
    });
    final response = await _dio.post<dynamic>('/upload/single', data: formData);
    final urls = response.data['urls'] as Map<String, dynamic>?;
    if (urls != null && urls['full'] != null) {
      return urls['full'] as String;
    }
    return response.data['url'] as String? ?? '';
  }
}
