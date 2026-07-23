import 'setting_option.dart';

class SettingSection {
  final String id;
  final String title;
  final String? description;
  final List<SettingOption> settings;
  final int sortOrder;

  const SettingSection({
    required this.id,
    required this.title,
    this.description,
    this.settings = const [],
    this.sortOrder = 0,
  });

  factory SettingSection.fromJson(Map<String, dynamic> json) {
    return SettingSection(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      settings: (json['settings'] as List<dynamic>?)
              ?.map((e) =>
                  SettingOption.fromJson(e as Map<String, dynamic>),)
              .toList() ??
          [],
      sortOrder: json['sortOrder'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'settings': settings.map((s) => s.toJson()).toList(),
        'sortOrder': sortOrder,
      };
}
