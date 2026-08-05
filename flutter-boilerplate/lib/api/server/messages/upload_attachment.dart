import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/messages/message_attachment.dart';

final uploadAttachmentServerProvider = Provider(
  (ref) => UploadAttachmentServer(ref.read(dioProvider)),
);

class UploadAttachmentServer {
  final Dio _dio;

  UploadAttachmentServer(this._dio);

  Future<MessageAttachment> call(String filePath, String fileName) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(
        filePath,
        filename: fileName,
      ),
    });
    final response =
        await _dio.post<dynamic>('/upload/attachment', data: formData);
    final data = response.data as Map<String, dynamic>;
    return MessageAttachment(
      url: data['url'] as String,
      type: data['mimetype'] as String,
      name: data['originalname'] as String,
      storageEnvelope: data['envelope'] == null
          ? null
          : StorageEnvelope.fromJson(
              data['envelope'] as Map<String, dynamic>,
            ),
    );
  }
}
