class UploadConstants {
  UploadConstants._();

  static const int maxFileSize = 10 * 1024 * 1024; // 10MB
  static const int maxImageSize = 5 * 1024 * 1024; // 5MB
  static const int maxAvatarSize = 2 * 1024 * 1024; // 2MB
  static const List<String> allowedImageTypes = [
    'jpg',
    'jpeg',
    'png',
    'webp',
    'gif',
  ];
  static const List<String> allowedDocumentTypes = [
    'pdf',
    'doc',
    'docx',
    'txt',
  ];
  static const int maxUploadCount = 10;
}
