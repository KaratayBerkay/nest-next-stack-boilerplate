import 'package:emoji_picker_flutter/emoji_picker_flutter.dart' as picker;
import 'package:flutter/material.dart';

import '../../../constants/theme.dart';
import '../popover/popover.dart';

/// Mirrors next-js-boilerplate's
/// `components/ui/emoji-picker/emoji-picker-button.tsx` — a button that
/// opens a popover emoji picker. Web wraps `emoji-mart`; this wraps
/// `emoji_picker_flutter`, the same package `chat_input_bar.dart` already
/// uses for the real chat composer.
class EmojiPickerButton extends StatelessWidget {
  final void Function(String emoji) onEmojiSelect;
  final String label;

  const EmojiPickerButton({
    super.key,
    required this.onEmojiSelect,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return PopoverWidget(
      popoverBuilder: (_, close) => SizedBox(
        width: 320,
        height: 400,
        child: picker.EmojiPicker(
          onEmojiSelected: (_, emoji) {
            onEmojiSelect(emoji.emoji);
            close();
          },
        ),
      ),
      child: Tooltip(
        message: label,
        child: Container(
          width: 36,
          height: 36,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(6),
          ),
          child: Icon(
            Icons.emoji_emotions_outlined,
            size: 20,
            color: colors.fgMuted,
          ),
        ),
      ),
    );
  }
}
