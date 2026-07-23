import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/api/urls.dart';
import '../../../lib/api_client.dart';

final profileUpdateServerProvider = Provider((ref) => ProfileUpdateServer(ref.read(dioProvider)));

class ProfileUpdateServer {
  final Dio _dio;

  ProfileUpdateServer(this._dio);

  Future<void> call({String? name, String? bio}) async {
    final data = <String, dynamic>{};
    if (name != null) data['name'] = name;
    if (bio != null) data['bio'] = bio;
    await _dio.put<dynamic>(Urls.profileUpdate, data: data);
  }
}
