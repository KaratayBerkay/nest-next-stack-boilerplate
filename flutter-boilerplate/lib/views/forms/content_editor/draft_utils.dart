import 'dart:convert';
import 'package:flutter/foundation.dart';

class DraftData {
  final String title;
  final String body;
  final String tags;
  final DateTime savedAt;

  const DraftData({
    required this.title,
    required this.body,
    required this.tags,
    required this.savedAt,
  });

  Map<String, dynamic> toJson() => {
    'title': title,
    'body': body,
    'tags': tags,
    'savedAt': savedAt.toIso8601String(),
  };

  factory DraftData.fromJson(Map<String, dynamic> json) => DraftData(
    title: json['title'] as String,
    body: json['body'] as String,
    tags: json['tags'] as String,
    savedAt: DateTime.parse(json['savedAt'] as String),
  );
}

class DraftManager {
  static const _draftKey = 'editor_draft';

  static DraftData createDraft({
    required String title,
    required String body,
    required String tags,
  }) {
    return DraftData(
      title: title,
      body: body,
      tags: tags,
      savedAt: DateTime.now(),
    );
  }

  static String serializeDraft(DraftData draft) {
    return jsonEncode(draft.toJson());
  }

  static DraftData? deserializeDraft(String json) {
    try {
      return DraftData.fromJson(jsonDecode(json) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  static bool isDraftStale(DraftData draft, {Duration maxAge = const Duration(days: 7)}) {
    return DateTime.now().difference(draft.savedAt) > maxAge;
  }
}
