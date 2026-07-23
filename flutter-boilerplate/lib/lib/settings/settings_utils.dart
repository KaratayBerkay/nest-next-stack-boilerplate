String formatSettingKey(String key) {
  return key
      .split('_')
      .map((word) => word.isNotEmpty
          ? '${word[0].toUpperCase()}${word.substring(1).toLowerCase()}'
          : '')
      .join(' ');
}

bool validateSettingValue(String key, dynamic value) {
  if (value == null) return false;
  if (value is String && value.isEmpty) return false;
  return true;
}
