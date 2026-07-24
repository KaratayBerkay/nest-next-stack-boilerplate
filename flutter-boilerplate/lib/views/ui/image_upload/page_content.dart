import 'package:flutter/material.dart';

class ImageUploadDemoPage extends StatelessWidget {
  final String lang;
  const ImageUploadDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Image Upload')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 48,
                    backgroundColor: colors.primaryContainer,
                    child: Icon(
                      Icons.person,
                      size: 48,
                      color: colors.onPrimaryContainer,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.camera_alt),
                    label: const Text('Upload Photo'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
