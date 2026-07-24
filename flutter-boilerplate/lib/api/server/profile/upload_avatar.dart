import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';

final profileUploadAvatarServerProvider = Provider(
  (ref) => ProfileUploadAvatarServer(ref.read(dioProvider)),
);

class ProfileUploadAvatarServer {
  final Dio _dio;

  ProfileUploadAvatarServer(this._dio);

  Future<String> call(String filePath) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath),
    });
    final response =
        await _dio.post<dynamic>('${Urls.profile}/avatar', data: formData);
    return response.data['avatarUrl'] as String;
  }
}
