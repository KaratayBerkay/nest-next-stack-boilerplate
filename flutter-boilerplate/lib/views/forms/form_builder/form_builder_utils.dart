import 'package:flutter/material.dart';

enum FieldType { text, email, password, number, textarea, select, checkbox, switch_ }

class FormFieldConfig {
  final String id;
  final String label;
  final FieldType type;
  final bool required;
  final String? hint;
  final List<String>? options;

  FormFieldConfig({
    required this.id,
    required this.label,
    this.type = FieldType.text,
    this.required = false,
    this.hint,
    this.options,
  });

  FormFieldConfig copyWith({
    String? id,
    String? label,
    FieldType? type,
    bool? required,
    String? hint,
    List<String>? options,
  }) {
    return FormFieldConfig(
      id: id ?? this.id,
      label: label ?? this.label,
      type: type ?? this.type,
      required: required ?? this.required,
      hint: hint ?? this.hint,
      options: options ?? this.options,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'label': label,
      'type': type.name,
      'required': required,
      'hint': hint,
      'options': options,
    };
  }

  static FormFieldConfig fromJson(Map<String, dynamic> json) {
    return FormFieldConfig(
      id: json['id'] as String,
      label: json['label'] as String,
      type: FieldType.values.firstWhere((t) => t.name == json['type']),
      required: json['required'] as bool? ?? false,
      hint: json['hint'] as String?,
      options: (json['options'] as List<dynamic>?)?.cast<String>(),
    );
  }
}

class FormBuilderModel extends ChangeNotifier {
  final List<FormFieldConfig> _fields = [];
  int _counter = 0;

  List<FormFieldConfig> get fields => List.unmodifiable(_fields);

  void addField({FieldType type = FieldType.text}) {
    _counter++;
    _fields.add(FormFieldConfig(
      id: 'field_$_counter',
      label: 'Field $_counter',
      type: type,
    ),);
    notifyListeners();
  }

  void removeField(String id) {
    _fields.removeWhere((f) => f.id == id);
    notifyListeners();
  }

  void updateField(String id, FormFieldConfig updated) {
    final idx = _fields.indexWhere((f) => f.id == id);
    if (idx != -1) {
      _fields[idx] = updated;
      notifyListeners();
    }
  }

  void moveField(int oldIndex, int newIndex) {
    if (newIndex > oldIndex) newIndex--;
    final field = _fields.removeAt(oldIndex);
    _fields.insert(newIndex, field);
    notifyListeners();
  }

  void clear() {
    _fields.clear();
    _counter = 0;
    notifyListeners();
  }
}
