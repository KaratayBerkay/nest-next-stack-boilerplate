import 'package:emoji_picker_flutter/emoji_picker_flutter.dart';
import 'package:flutter/material.dart';

/// Inserts [emoji] at [controller]'s current cursor/selection — the Flutter
/// twin of web's `lib/insert-emoji-at-cursor.ts`, shared by every chat
/// composer (DM input bar, chat-room composer) instead of each keeping its
/// own copy of the selection math.
void insertEmojiAtCursor(TextEditingController controller, Emoji emoji) {
  final text = controller.text;
  final selection = controller.selection;
  final start = selection.isValid ? selection.start : text.length;
  final end = selection.isValid ? selection.end : text.length;
  final updated = text.replaceRange(start, end, emoji.emoji);
  controller.value = TextEditingValue(
    text: updated,
    selection: TextSelection.collapsed(offset: start + emoji.emoji.length),
  );
}
