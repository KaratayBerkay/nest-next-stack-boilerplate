import 'package:flutter/material.dart';

import '../../../components/ui/emoji_picker_button/emoji_picker_button.dart';

class EmojiPickerDemoPage extends StatefulWidget {
  final String lang;

  const EmojiPickerDemoPage({super.key, required this.lang});

  @override
  State<EmojiPickerDemoPage> createState() => _EmojiPickerDemoPageState();
}

class _EmojiPickerDemoPageState extends State<EmojiPickerDemoPage> {
  final _controller = TextEditingController(text: 'Try the emoji button');

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          'Default',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        EmojiPickerButton(
          label: 'Pick emoji',
          onEmojiSelect: (emoji) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Selected: $emoji')),
            );
          },
        ),
        const SizedBox(height: 24),
        const Text(
          'Composer-style usage',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _controller,
                decoration: const InputDecoration(isDense: true),
              ),
            ),
            const SizedBox(width: 12),
            EmojiPickerButton(
              label: 'Insert emoji',
              onEmojiSelect: (emoji) {
                _controller.text = '${_controller.text}$emoji';
              },
            ),
          ],
        ),
      ],
    );
  }
}
