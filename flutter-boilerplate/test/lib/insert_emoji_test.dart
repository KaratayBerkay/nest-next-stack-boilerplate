import 'package:emoji_picker_flutter/emoji_picker_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/insert_emoji.dart';
import 'package:flutter_test/flutter_test.dart';

const _smile = Emoji('😀', 'grinning');

void main() {
  group('insertEmojiAtCursor', () {
    test('inserts at the cursor position', () {
      final controller = TextEditingController(text: 'hello world');
      addTearDown(controller.dispose);
      controller.selection = const TextSelection.collapsed(offset: 5);

      insertEmojiAtCursor(controller, _smile);

      expect(controller.text, 'hello😀 world');
      expect(controller.selection.baseOffset, 5 + _smile.emoji.length);
    });

    test('replaces the active selection', () {
      final controller = TextEditingController(text: 'hello world');
      addTearDown(controller.dispose);
      controller.selection =
          const TextSelection(baseOffset: 6, extentOffset: 11);

      insertEmojiAtCursor(controller, _smile);

      expect(controller.text, 'hello 😀');
    });

    test('appends at the end when there is no valid selection', () {
      final controller = TextEditingController(text: 'abc');
      addTearDown(controller.dispose);
      controller.selection = const TextSelection.collapsed(offset: -1);

      insertEmojiAtCursor(controller, _smile);

      expect(controller.text, 'abc😀');
    });
  });
}
